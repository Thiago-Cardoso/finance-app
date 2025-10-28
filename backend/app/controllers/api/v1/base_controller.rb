# frozen_string_literal: true

module Api
  module V1
    class BaseController < ApplicationController
      include Authenticable
      include Paginable
      include Localizable

      before_action :authenticate_user!

      respond_to :json

      # Override parent class handlers to ensure correct behavior in API v1
      # Specific exceptions MUST be declared before StandardError
      rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
      rescue_from ActiveRecord::RecordInvalid, with: :render_validation_errors

      # JWT-specific error handling (specific to API v1)
      rescue_from JwtService::TokenExpiredError, with: :render_token_expired
      rescue_from JwtService::TokenInvalidError, with: :render_unauthorized

      private

      def render_success(data = {}, message = 'Success', status = :ok)
        render json: {
          success: true,
          data: data,
          message: message
        }, status: status
      end

      def render_error(message, errors = [], status = :unprocessable_entity)
        render json: {
          success: false,
          message: message,
          errors: errors
        }, status: status
      end

      def render_internal_server_error(exception = nil)
        error_message = exception&.message || 'An unexpected error occurred'
        
        Rails.logger.error("Internal Server Error: #{error_message}")
        Rails.logger.error(exception.backtrace.join("\n")) if exception&.backtrace

        render_error('An unexpected error occurred', [error_message], :internal_server_error)
      end

      def render_not_found(_exception = nil)
        render_error('Resource not found', [{ field: 'id', message: 'Record not found' }], :not_found)
      end

      def render_validation_errors(exception)
        errors = exception.record.errors.map do |error|
          { field: error.attribute, message: error.message }
        end

        render_error('Validation failed', errors, :unprocessable_entity)
      end

      def render_unauthorized(_exception = nil)
        render_error('Unauthorized', [{ field: 'authorization', message: 'Invalid or missing token' }], :unauthorized)
      end

      def render_token_expired(_exception = nil)
        render_error('Token expired', [{ field: 'authorization', message: 'Token has expired' }], :unauthorized)
      end
    end
  end
end