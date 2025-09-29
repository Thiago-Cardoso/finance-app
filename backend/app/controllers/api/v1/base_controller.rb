class Api::V1::BaseController < ApplicationController
  before_action :set_default_format
  before_action :log_request_info

  private

  def set_default_format
    request.format = :json
  end

  # Authentication will be implemented in task 6.0
  # before_action :authenticate_user!
  #
  # def current_user
  #   @current_user
  # end
  #
  # def authenticate_user!
  #   # JWT authentication logic will be implemented
  # end
end