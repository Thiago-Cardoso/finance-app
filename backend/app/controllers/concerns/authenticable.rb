# frozen_string_literal: true

# Concern for JWT authentication in API controllers
module Authenticable
  extend ActiveSupport::Concern

  private

  # Authenticate user from JWT token
  def authenticate_user!
    token = extract_token_from_header

    unless token
      return render_error(
        'Authentication required',
        [{ field: 'authorization', message: 'Token not provided' }],
        :unauthorized
      )
    end

    begin
      payload = JwtService.decode(token)
      @current_user = User.find_by(id: payload[:user_id], jti: payload[:jti])

      unless @current_user
        return render_error(
          'Authentication failed',
          [{ field: 'authorization', message: 'Invalid or revoked token' }],
          :unauthorized
        )
      end
    rescue JwtService::TokenExpiredError => e
      render_error(
        'Token expired',
        [{ field: 'authorization', message: e.message }],
        :unauthorized
      )
    rescue JwtService::TokenInvalidError => e
      render_error(
        'Invalid token',
        [{ field: 'authorization', message: e.message }],
        :unauthorized
      )
    end
  end

  # Get current authenticated user
  def current_user
    @current_user
  end

  # Extract JWT token from Authorization header
  def extract_token_from_header
    header = request.headers['Authorization']
    return nil unless header

    header.split.last if header.start_with?('Bearer ')
  end
end