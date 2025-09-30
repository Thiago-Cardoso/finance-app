# frozen_string_literal: true

# Service for JWT token encoding, decoding, and management
class JwtService
  JWT_SECRET = ENV.fetch('JWT_SECRET_KEY') { Rails.application.credentials.secret_key_base }
  JWT_ALGORITHM = 'HS256'

  class << self
    # Encode payload into JWT token with expiration
    def encode(payload, expiration = 24.hours.from_now)
      payload[:exp] = expiration.to_i
      payload[:iat] = Time.current.to_i
      JWT.encode(payload, JWT_SECRET, JWT_ALGORITHM)
    end

    # Decode JWT token and return payload
    def decode(token)
      decoded = JWT.decode(token, JWT_SECRET, true, {
        algorithm: JWT_ALGORITHM,
        verify_expiration: true,
        verify_iat: true
      })
      HashWithIndifferentAccess.new(decoded[0])
    rescue JWT::ExpiredSignature => e
      raise TokenExpiredError, 'Token has expired'
    rescue JWT::DecodeError => e
      raise TokenInvalidError, 'Invalid token'
    end

    # Generate both access and refresh tokens for a user
    def generate_tokens(user)
      access_payload = {
        user_id: user.id,
        jti: user.jti,
        email: user.email
      }

      refresh_payload = {
        user_id: user.id,
        jti: user.jti,
        type: 'refresh'
      }

      {
        access_token: encode(access_payload),
        refresh_token: encode(refresh_payload, 7.days.from_now),
        expires_in: 24.hours.to_i
      }
    end

    # Refresh access token using a valid refresh token
    def refresh_access_token(refresh_token)
      payload = decode(refresh_token)

      unless payload[:type] == 'refresh'
        raise TokenInvalidError, 'Invalid refresh token type'
      end

      user = User.find_by(id: payload[:user_id], jti: payload[:jti])
      raise TokenInvalidError, 'User not found or token revoked' unless user

      generate_tokens(user)
    end
  end

  # Custom error classes for JWT operations
  class TokenExpiredError < StandardError; end
  class TokenInvalidError < StandardError; end
end