module Reports
  class BaseGenerator
    attr_reader :user, :filters, :report

    def initialize(user, filters = {})
      @user = user
      @filters = filters
      @report = nil
    end

    # Main method to generate the report
    def generate
      validate_filters!

      @report = create_report
      @report.mark_as_processing!

      begin
        data = fetch_data
        processed_data = process_data(data)
        result = format_result(processed_data)

        @report.mark_as_completed!
        result
      rescue StandardError => e
        @report.mark_as_failed! if @report
        Rails.logger.error("Report generation failed: #{e.message}")
        raise e
      end
    end

    # To be overridden by subclasses
    def fetch_data
      raise NotImplementedError, "Subclasses must implement #fetch_data"
    end

    # To be overridden by subclasses
    def process_data(data)
      raise NotImplementedError, "Subclasses must implement #process_data"
    end

    # To be overridden by subclasses
    def format_result(processed_data)
      raise NotImplementedError, "Subclasses must implement #format_result"
    end

    protected

    # Create the report record
    def create_report
      Report.create!(
        user: user,
        name: report_name,
        report_type: report_type,
        period_type: period_type,
        filter_criteria: filters
      )
    end

    # To be overridden by subclasses
    def report_name
      raise NotImplementedError, "Subclasses must implement #report_name"
    end

    # To be overridden by subclasses
    def report_type
      raise NotImplementedError, "Subclasses must implement #report_type"
    end

    # Default period type
    def period_type
      filters[:period_type] || :monthly
    end

    # Date range helpers
    def start_date
      @start_date ||= parse_start_date
    end

    def end_date
      @end_date ||= parse_end_date
    end

    def parse_start_date
      return filters[:start_date].to_date if filters[:start_date].present?

      case period_type.to_sym
      when :daily
        Date.current
      when :weekly
        Date.current.beginning_of_week
      when :monthly
        Date.current.beginning_of_month
      when :quarterly
        Date.current.beginning_of_quarter
      when :yearly
        Date.current.beginning_of_year
      else
        Date.current.beginning_of_month
      end
    end

    def parse_end_date
      return filters[:end_date].to_date if filters[:end_date].present?

      case period_type.to_sym
      when :daily
        Date.current
      when :weekly
        Date.current.end_of_week
      when :monthly
        Date.current.end_of_month
      when :quarterly
        Date.current.end_of_quarter
      when :yearly
        Date.current.end_of_year
      else
        Date.current.end_of_month
      end
    end

    # Validation
    def validate_filters!
      return true if filters[:start_date].blank? && filters[:end_date].blank?

      if filters[:start_date].present? && filters[:end_date].present?
        start_d = filters[:start_date].to_date
        end_d = filters[:end_date].to_date

        raise ArgumentError, "Start date must be before end date" if start_d > end_d
      end
    end

    # Scoped transactions for the user within date range
    def scoped_transactions
      user.transactions
          .where(date: start_date..end_date)
    end

    # Scoped categories for the user
    def scoped_categories
      user.categories.active
    end

    # Scoped accounts for the user
    def scoped_accounts
      user.accounts.active
    end

    # Currency formatting helper
    def format_currency(amount)
      ActionController::Base.helpers.number_to_currency(amount, unit: "R$ ", separator: ",", delimiter: ".")
    end

    # Percentage calculation helper
    def calculate_percentage(part, total)
      return 0 if total.zero?
      ((part.to_f / total) * 100).round(2)
    end
  end
end
