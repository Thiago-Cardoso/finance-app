# frozen_string_literal: true

# Service for complex transaction filtering and search operations
class TransactionFilterService
  VALID_PERIODS = %w[this_month last_month this_year last_year].freeze
  VALID_SORT_FIELDS = %w[date amount description].freeze
  VALID_SORT_DIRECTIONS = %w[asc desc].freeze

  def initialize(user, params = {})
    @user = user
    @params = params.with_indifferent_access
  end

  def call
    transactions = Transaction.for_user(@user)
    transactions = apply_filters(transactions)
    transactions = apply_sorting(transactions)
    
    # Build metadata before pagination for accurate totals
    meta = build_metadata(transactions)
    
    # Apply pagination if requested
    if @params[:page].present? || @params[:per_page].present?
      transactions = transactions.includes(:category, :account, :transfer_account)
                                 .page(@params[:page])
                                 .per(@params[:per_page] || 25)
    end

    {
      transactions: transactions,
      meta: meta
    }
  end

  def filter_options
    {
      periods: VALID_PERIODS,
      transaction_types: Transaction::TRANSACTION_TYPES,
      categories: @user.available_categories.select(:id, :name, :category_type, :color, :icon),
      accounts: @user.accounts.active.select(:id, :name, :account_type),
      sort_fields: VALID_SORT_FIELDS,
      sort_directions: VALID_SORT_DIRECTIONS
    }
  end

  def search_suggestions(query)
    return [] if query.blank? || query.length < 2

    Transaction.for_user(@user)
               .search_description(query)
               .select(:description)
               .distinct
               .limit(10)
               .pluck(:description)
  end

  private

  def apply_filters(scope)
    # Text search
    scope = scope.search_description(@params[:search]) if @params[:search].present?

    # Category filters
    scope = apply_category_filter(scope)

    # Transaction type
    scope = scope.by_type(@params[:transaction_type]) if @params[:transaction_type].present?

    # Account filter (with ownership validation)
    if @params[:account_id].present?
      account = @user.accounts.find_by(id: @params[:account_id])
      scope = scope.by_account(account) if account
    end

    # Date filters
    scope = apply_date_filter(scope)

    # Amount range
    scope = apply_amount_filter(scope)

    scope
  end

  def apply_category_filter(scope)
    if @params[:category_id].present?
      # Validate ownership/availability
      category = @user.available_categories.find_by(id: @params[:category_id])
      return scope unless category

      scope.by_category(category)
    elsif @params[:category_ids].present?
      # Validate ownership/availability - only use categories available to user
      category_ids = @user.available_categories.where(id: Array(@params[:category_ids])).pluck(:id)
      return scope if category_ids.empty?

      scope.by_categories(category_ids)
    else
      scope
    end
  end

  def apply_date_filter(scope)
    if @params[:period].present? && VALID_PERIODS.include?(@params[:period])
      apply_period_filter(scope, @params[:period])
    elsif @params[:start_date].present? && @params[:end_date].present?
      begin
        start_date = Date.parse(@params[:start_date].to_s)
        end_date = Date.parse(@params[:end_date].to_s)
        scope.by_date_range(start_date, end_date)
      rescue ArgumentError
        scope # Invalid date format, return unfiltered
      end
    else
      scope
    end
  end

  def apply_period_filter(scope, period)
    case period
    when 'this_month' then scope.this_month
    when 'last_month' then scope.last_month
    when 'this_year' then scope.this_year
    when 'last_year' then scope.last_year
    else scope
    end
  end

  def apply_amount_filter(scope)
    min_amount = @params[:min_amount]
    max_amount = @params[:max_amount]

    return scope if min_amount.blank? && max_amount.blank?

    scope.by_amount_range(min_amount, max_amount)
  end

  def apply_sorting(scope)
    sort_by = @params[:sort_by].presence || 'date'
    sort_direction = @params[:sort_direction].presence || 'desc'

    # Validate sort parameters
    sort_by = 'date' unless VALID_SORT_FIELDS.include?(sort_by)
    sort_direction = 'desc' unless VALID_SORT_DIRECTIONS.include?(sort_direction)

    Transaction.apply_sorting(scope, sort_by, sort_direction)
  end

  def build_metadata(scope)
    {
      total_count: scope.count,
      total_income: scope.by_type('income').sum(:amount).to_f,
      total_expenses: scope.by_type('expense').sum(:amount).to_f,
      net_amount: (scope.by_type('income').sum(:amount) - scope.by_type('expense').sum(:amount)).to_f,
      filters_applied: active_filters
    }
  end

  def active_filters
    filters = {}
    filters[:search] = @params[:search] if @params[:search].present?
    filters[:category_id] = @params[:category_id] if @params[:category_id].present?
    filters[:category_ids] = @params[:category_ids] if @params[:category_ids].present?
    filters[:transaction_type] = @params[:transaction_type] if @params[:transaction_type].present?
    filters[:account_id] = @params[:account_id] if @params[:account_id].present?
    filters[:period] = @params[:period] if @params[:period].present?

    if @params[:start_date].present? && @params[:end_date].present?
      filters[:date_range] = {
        start: @params[:start_date],
        end: @params[:end_date]
      }
    end

    if @params[:min_amount].present? || @params[:max_amount].present?
      filters[:amount_range] = {
        min: @params[:min_amount],
        max: @params[:max_amount]
      }
    end

    filters
  end
end
