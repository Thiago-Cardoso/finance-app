# frozen_string_literal: true

# Base controller for API v1 endpoints with authentication and error handling
module Api
  module V1
    class BaseController < ApplicationController
      include Authenticable

      # protect_from_forgery not needed in API-only mode
      respond_to :json

      rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
      rescue_from ActiveRecord::RecordInvalid, with: :render_validation_errors
      rescue_from JwtService::TokenExpiredError, with: :render_token_expired
      rescue_from JwtService::TokenInvalidError, with: :render_unauthorized

      private

      # Render success response with data
      def render_success(data = {}, message = 'Success', status = :ok)
        render json: {
          success: true,
          data: data,
          message: message
        }, status: status
      end

      # Render error response with message and errors array
      def render_error(message, errors = [], status = :unprocessable_entity)
        render json: {
          success: false,
          message: message,
          errors: errors
        }, status: status
      end

      # Render 404 not found error
      def render_not_found(_exception)
        render json: {
          success: false,
          message: 'Resource not found',
          errors: [{ field: 'id', message: 'Record not found' }]
        }, status: :not_found
      end

      # Render validation errors from ActiveRecord
      def render_validation_errors(exception)
        errors = exception.record.errors.map do |error|
          { field: error.attribute, message: error.message }
        end

        render_error('Validation failed', errors, :unprocessable_entity)
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
  end
end