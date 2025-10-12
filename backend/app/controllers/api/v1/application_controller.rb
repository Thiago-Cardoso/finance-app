# frozen_string_literal: true

# Application controller for API v1 namespace
module Api
  module V1
    class ApplicationController < ::ApplicationController
      respond_to :json
    end
  end
end
