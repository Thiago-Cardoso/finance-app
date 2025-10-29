# frozen_string_literal: true

# Service to calculate category-related statistics
class CategoryStatisticsService
  def initialize(user, params = {})
    @user = user
    @params = params
    # Correctly handle default dates and ensure they are Date objects
    @start_date = parse_date(@params[:start_date]) || 6.months.ago.beginning_of_month.to_date
    @end_date = parse_date(@params[:end_date]) || Date.current.end_of_month.to_date
  end

  def call
    {
      summary: category_summary,
      top_categories: top_categories_by_amount,
      monthly_breakdown: monthly_breakdown,
      category_trends: category_trends
    }
  end

  private

  def category_summary
    # Correctly scope categories to user or default, and ensure they are active
    active_categories = Category.where(is_active: true)
                                .where(user: @user)
                                .or(Category.where(is_active: true, is_default: true))

    # Use a single query to get used category IDs for the current user
    used_category_ids = @user.transactions.distinct.pluck(:category_id)

    categories_with_trans_count = active_categories.where(id: used_category_ids).count
    unused_categories_count = active_categories.where.not(id: used_category_ids).count

    {
      total_categories: active_categories.count,
      active_categories: active_categories.count,
      categories_with_transactions: categories_with_trans_count,
      unused_categories: unused_categories_count
    }
  end

  def top_categories_by_amount
    # Pre-calculate transaction counts for efficiency
    counts = transaction_counts_by_category

    top_categories = @user.transactions
         .joins(:category)
         .where(date: @start_date..@end_date)
         .group('categories.id', 'categories.name', 'categories.color', 'categories.category_type')
         .sum('ABS(transactions.amount)')
         .map do |category_info, amount|
           category_id = category_info[0]
           {
             id: category_id,
             name: category_info[1],
             color: category_info[2],
             category_type: category_info[3],
             total_amount: amount.to_f, # Ensure it's a float
             transactions_count: counts[category_id] || 0
           }
         end
         .sort_by { |cat| -cat[:total_amount] }
         .first(10)

    top_categories || []
  end

  def monthly_breakdown
    # More efficient grouping using ActiveRecord
    breakdown = @user.transactions
                     .joins(:category)
                     .where(date: @start_date..@end_date)
                     .group('categories.id', 'categories.name', "DATE_TRUNC('month', transactions.date)")
                     .sum('ABS(transactions.amount)')

    # Restructure the data for the expected output format
    result = breakdown.each_with_object({}) do |(group_keys, total), result_hash|
      cat_id, cat_name, month_date = group_keys
      month_str = month_date.strftime('%Y-%m')

      result_hash[cat_name] ||= { id: cat_id, months: {} }
      result_hash[cat_name][:months][month_str] = total.to_f
    end

    result || {}
  end

  def category_trends
    # Define periods more clearly: last full month vs. previous full month
    last_month_start = 1.month.ago.beginning_of_month
    last_month_end = 1.month.ago.end_of_month
    prev_month_start = 2.months.ago.beginning_of_month
    prev_month_end = 2.months.ago.end_of_month

    current_period_data = @user.transactions
                               .joins(:category)
                               .where(date: last_month_start..last_month_end)
                               .group('categories.name', 'categories.id')
                               .sum('ABS(transactions.amount)')

    previous_period_data = @user.transactions
                                .joins(:category)
                                .where(date: prev_month_start..prev_month_end)
                                .group('categories.name', 'categories.id')
                                .sum('ABS(transactions.amount)')

    all_category_keys = (current_period_data.keys + previous_period_data.keys).uniq

    trends = {}
    all_category_keys.each do |cat_name, cat_id|
      current_amount = current_period_data[[cat_name, cat_id]] || 0
      previous_amount = previous_period_data[[cat_name, cat_id]] || 0

      change_percent = if previous_amount > 0
                         ((current_amount - previous_amount) / previous_amount * 100).round(1)
                       else
                         current_amount > 0 ? 100.0 : 0.0
                       end

      trends[cat_name] = {
        id: cat_id,
        current_amount: current_amount.to_f,
        previous_amount: previous_amount.to_f,
        change_percent: change_percent,
        trend: determine_trend(change_percent)
      }
    end

    trends
  end

  def determine_trend(change_percent)
    if change_percent > 5
      'increasing'
    elsif change_percent < -5
      'decreasing'
    else
      'stable'
    end
  end

  def transaction_counts_by_category
    @transaction_counts ||= @user.transactions
                                 .where(date: @start_date..@end_date)
                                 .group(:category_id)
                                 .count
  end

  def parse_date(date_string)
    # Return Date object on success, nil on failure
    Date.parse(date_string) if date_string.present?
  rescue Date::Error, ArgumentError
    nil
  end
end