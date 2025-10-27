class ApplicationController < ActionController::API
  include ActionController::MimeResponds

  respond_to :json

  # Global error handling
  rescue_from StandardError, with: :handle_internal_server_error
  rescue_from ActiveRecord::RecordNotFound, with: :handle_not_found
  rescue_from ActiveRecord::RecordInvalid, with: :handle_unprocessable_entity
  rescue_from ActionController::ParameterMissing, with: :handle_bad_request
  rescue_from ActiveRecord::RecordNotUnique, with: :handle_conflict

  private

  # Standard API response format
  def success_response(data: nil, message: 'Success', status: :ok, meta: {})
    response_body = {
      success: true,
      message: message
    }

    response_body[:data] = data if data.present?
    response_body[:meta] = meta if meta.present?

    render json: response_body, status: status
  end

  def error_response(message: 'An error occurred', errors: [], status: :unprocessable_entity)
    render json: {
      success: false,
      message: message,
      errors: errors
    }, status: status
  end

  # Error handlers
  def handle_not_found(exception)
    Rails.logger.error "Not Found: #{exception.message}"
    error_response(
      message: 'Resource not found',
      status: :not_found
    )
  end

  def handle_unprocessable_entity(exception)
    Rails.logger.error "Validation Error: #{exception.message}"
    error_response(
      message: 'Validation failed',
      errors: format_validation_errors(exception.record),
      status: :unprocessable_entity
    )
  end

  def handle_bad_request(exception)
    Rails.logger.error "Bad Request: #{exception.message}"
    error_response(
      message: 'Invalid request parameters',
      errors: [exception.message],
      status: :bad_request
    )
  end

  def handle_conflict(exception)
    Rails.logger.error "Conflict: #{exception.message}"
    error_response(
      message: 'Resource conflict',
      errors: [exception.message],
      status: :conflict
    )
  end

  def handle_internal_server_error(exception)
    Rails.logger.error "Internal Server Error: #{exception.message}"
    Rails.logger.error exception.backtrace.join("\n")

    error_response(
      message: 'Internal server error',
      status: :internal_server_error
    )
  end

  # Format ActiveRecord validation errors
  def format_validation_errors(record)
    return [] unless record&.errors

    record.errors.map do |attribute, message|
      {
        field: attribute,
        message: message
      }
    end
  end

  # Pagination helpers
  def pagination_meta(collection)
    {
      pagination: {
        current_page: collection.current_page,
        total_pages: collection.total_pages,
        total_count: collection.total_count,
        per_page: collection.limit_value
      }
    }
  end

  # Request logging
  def log_request_info
    Rails.logger.info "#{request.method} #{request.path} - Params: #{params.except(:controller, :action)}"
  end
end
