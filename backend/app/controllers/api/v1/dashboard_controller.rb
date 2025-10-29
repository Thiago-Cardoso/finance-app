# frozen_string_literal: true

module Api
  module V1
    class DashboardController < BaseController
      before_action :authenticate_user!

      def show
        cache_key = "dashboard/#{current_user.id}/#{dashboard_params.to_h.to_json}"

        @dashboard_data = Rails.cache.fetch(cache_key, expires_in: 5.minutes) do
          DashboardService.new(current_user, dashboard_params).call
        end

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
