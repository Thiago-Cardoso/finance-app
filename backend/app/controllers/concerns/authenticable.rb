# frozen_string_literal: true

# Concern for JWT authentication in API controllers
module Authenticable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  private

  # Authenticate user from JWT token
  def authenticate_user!
    token = extract_token_from_header
    return render_unauthorized unless token

    payload = JwtService.decode(token)
    @current_user = User.find_by(id: payload[:user_id], jti: payload[:jti])

    render_unauthorized unless @current_user
  rescue JwtService::TokenExpiredError => e
    render_token_expired(e)
  rescue JwtService::TokenInvalidError => e
    render_unauthorized(e)
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

  # Render unauthorized error
  def render_unauthorized(_exception = nil)
    render json: {
      success: false,
      message: 'Unauthorized',
      errors: [{ field: 'authorization', message: 'Invalid or missing token' }]
    }, status: :unauthorized
  end

  # Render token expired error
  def render_token_expired(_exception)
    render json: {
      success: false,
      message: 'Token expired',
      errors: [{ field: 'authorization', message: 'Token has expired' }]
    }, status: :unauthorized
  end
end
