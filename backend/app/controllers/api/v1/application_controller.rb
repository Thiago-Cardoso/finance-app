class Api::V1::ApplicationController < Api::V1::BaseController
  # Catch-all for unmatched API routes
  def not_found
    error_response(
      message: 'API endpoint not found',
      status: :not_found
    )
  end
end