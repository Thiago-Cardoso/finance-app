# frozen_string_literal: true

require 'jwt'

# JWT configuration for API authentication

module JwtAuth
  # Secret key for signing JWT tokens
  JWT_SECRET = ENV.fetch('JWT_SECRET_KEY') { Rails.application.credentials.secret_key_base }

  # Encryption algorithm
  JWT_ALGORITHM = 'HS256'

  # Token expiration time (24 hours)
  TOKEN_EXPIRATION = 24.hours

  # Codificar payload em token JWT
  def self.encode(payload, expiration = TOKEN_EXPIRATION.from_now)
    payload[:exp] = expiration.to_i
    payload[:iat] = Time.current.to_i

    JWT.encode(payload, JWT_SECRET, JWT_ALGORITHM)
  end

  # Decodificar token JWT
  def self.decode(token)
    decoded = JWT.decode(token, JWT_SECRET, true, { algorithm: JWT_ALGORITHM })
    decoded[0]
  rescue JWT::DecodeError, JWT::ExpiredSignature => e
    Rails.logger.error("JWT decode error: #{e.message}")
    nil
  end

  # Verificar se token é válido
  def self.valid_token?(token)
    decode(token).present?
  end
end