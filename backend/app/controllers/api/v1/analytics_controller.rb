# frozen_string_literal: true

module Api
  module V1
    class AnalyticsController < BaseController
      before_action :authenticate_user!

      # GET /api/v1/analytics/financial_summary
      def financial_summary
        filters = filter_params
        cache_key = "financial_summary/#{current_user.id}/#{filters.to_json}"

        result = Rails.cache.fetch(cache_key, expires_in: 1.hour) do
          generator = Reports::FinancialSummaryGenerator.new(current_user, filters)
          generator.generate
        end

        render_success(result)
      rescue ArgumentError => e
        render_error(e.message, [], :unprocessable_entity)
      rescue StandardError => e
        render_internal_server_error(e)
      end

      # GET /api/v1/analytics/budget_performance
      def budget_performance
        filters = filter_params
        cache_key = "budget_performance/#{current_user.id}/#{filters.to_json}"

        result = Rails.cache.fetch(cache_key, expires_in: 1.hour) do
          generator = Reports::BudgetPerformanceGenerator.new(current_user, filters)
          generator.generate
        end

        render_success(result)
      rescue ArgumentError => e
        render_error(e.message, [], :unprocessable_entity)
      rescue StandardError => e
        render_internal_server_error(e)
      end

      # GET /api/v1/analytics/export
      def export
        report_type = params[:report_type]
        format_type = params[:format] || 'pdf'

        unless %w[financial_summary budget_performance].include?(report_type)
          return render_error('Invalid report type', [], :bad_request)
        end

        unless %w[pdf excel xlsx csv].include?(format_type)
          return render_error('Invalid format type', [], :bad_request)
        end

        generator_class = case report_type
                          when 'financial_summary'
                            Reports::FinancialSummaryGenerator
                          when 'budget_performance'
                            Reports::BudgetPerformanceGenerator
                          end

        filters = filter_params
        generator = generator_class.new(current_user, filters)
        report_data = generator.generate

        exported_data = case format_type
                        when 'pdf'
                          Exporters::PdfExporter.new(report_data, report_type).export
                        when 'csv'
                          Exporters::CsvExporter.new(report_data, report_type).export
                        when 'excel', 'xlsx'
                          Exporters::ExcelExporter.new(report_data, report_type).export
                        end

        file_extension = case format_type
                         when 'pdf' then 'pdf'
                         when 'csv' then 'csv'
                         else 'xlsx'
                         end

        content_type = case format_type
                       when 'pdf' then 'application/pdf'
                       when 'csv' then 'text/csv'
                       else 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                       end

        filename = "#{report_type}_#{Time.current.strftime('%Y%m%d_%H%M%S')}.#{file_extension}"

        send_data exported_data,
                  filename: filename,
                  type: content_type,
                  disposition: 'attachment'
      rescue ArgumentError => e
        render_error(e.message, [], :unprocessable_entity)
      rescue StandardError => e
        render_internal_server_error(e)
      end

      # GET /api/v1/analytics/reports
      def reports
        reports = current_user.reports.recent.page(params[:page]).per(params[:per_page] || 20)

        render json: {
          success: true,
          data: reports.map { |report| report_json(report) },
          pagination: pagination_meta(reports)
        }
      rescue ArgumentError => e
        render_error(e.message, [], :unprocessable_entity)
      rescue StandardError => e
        render_internal_server_error(e)
      end

      # GET /api/v1/analytics/reports/:id
      def show_report
        report = current_user.reports.find_by(id: params[:id])
        return render_not_found unless report

        render_success(report_json(report))
      rescue StandardError => e
        render_internal_server_error(e)
      end

      # DELETE /api/v1/analytics/reports/:id
      def destroy_report
        report = current_user.reports.find_by(id: params[:id])
        return render_not_found unless report

        report.destroy
        render_success({}, 'Report deleted successfully')
      rescue StandardError => e
        render_internal_server_error(e)
      end

      private

      def filter_params
        params.permit(
          :period_type,
          :start_date,
          :end_date,
          :category_id,
          :account_id
        ).to_h.symbolize_keys
      end

      def report_json(report)
        {
          id: report.id,
          name: report.name,
          report_type: report.report_type,
          period_type: report.period_type,
          status: report.status,
          filter_criteria: report.filter_criteria,
          generated_at: report.generated_at,
          created_at: report.created_at
        }
      end

      def pagination_meta(collection)
        {
          current_page: collection.current_page,
          next_page: collection.next_page,
          prev_page: collection.prev_page,
          total_pages: collection.total_pages,
          total_count: collection.total_count
        }
      end
    end
  end
end