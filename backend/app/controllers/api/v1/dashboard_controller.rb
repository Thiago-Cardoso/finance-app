# frozen_string_literal: true

module Api
  module V1
    class DashboardController < BaseController
      before_action :authenticate_user!

      def show
        @dashboard_data = DashboardService.new(current_user, dashboard_params).call

        render json: {
          success: true,
          data: DashboardSerializer.new(@dashboard_data).as_json
        }
      end

      private

      def dashboard_params
        params.permit(:period, :start_date, :end_date)
      end
    end
  end
end
