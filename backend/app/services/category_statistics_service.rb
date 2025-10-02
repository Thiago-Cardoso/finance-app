# frozen_string_literal: true

# Service to calculate category-related statistics
class CategoryStatisticsService
  def initialize(user, params = {})
    @user = user
    @params = params
    @start_date = parse_date(@params[:start_date]) || 6.months.ago.beginning_of_month
    @end_date = parse_date(@params[:end_date]) || Date.current.end_of_month
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
    # Get all available categories without joins to avoid ambiguity
    all_categories = Category.where('categories.user_id = ? OR categories.is_default = true', @user.id)
                             .where(is_active: true)

    # Categories that have transactions for this user
    categories_with_trans = Category.joins(:transactions)
                                    .where('categories.user_id = ? OR categories.is_default = true', @user.id)
                                    .where('categories.is_active = true')
                                    .where('transactions.user_id = ?', @user.id)
                                    .distinct
                                    .count

    # Categories without any transactions for this user
    used_category_ids = Transaction.where(user: @user).distinct.pluck(:category_id)
    unused_count = all_categories.where.not(id: used_category_ids).count

    {
      total_categories: all_categories.count,
      active_categories: all_categories.count, # Already filtered by is_active
      categories_with_transactions: categories_with_trans,
      unused_categories: unused_count
    }
  end

  def top_categories_by_amount
    @user.transactions
         .joins(:category)
         .where(date: @start_date..@end_date)
         .group('categories.id', 'categories.name', 'categories.color', 'categories.category_type')
         .sum(:amount)
         .map do |category_info, amount|
           category_id = category_info[0]
           {
             id: category_id,
             name: category_info[1],
             color: category_info[2],
             category_type: category_info[3],
             total_amount: amount.abs,
             transactions_count: transaction_counts_by_category[category_id] || 0
           }
         end
         .sort_by { |cat| -cat[:total_amount] }
         .first(10)
  end

  def monthly_breakdown
    # Group transactions by category and month using Ruby (database-agnostic)
    transactions = @user.transactions
                        .joins(:category)
                        .where(date: @start_date..@end_date)
                        .select('categories.id as category_id', 'categories.name as category_name',
                                'transactions.date', 'transactions.amount')

    # Group by category and month in Ruby
    grouped = transactions.each_with_object({}) do |transaction, hash|
      month = transaction.date.strftime('%Y-%m')
      cat_name = transaction.category_name
      cat_id = transaction.category_id

      hash[cat_name] ||= { id: cat_id, months: {} }
      hash[cat_name][:months][month] ||= 0
      hash[cat_name][:months][month] += transaction.amount.abs
    end

    grouped
  end

  def category_trends
    current_period = @user.transactions
                          .joins(:category)
                          .where(date: (@end_date - 1.month)..@end_date)
                          .group('categories.name', 'categories.id')
                          .sum(:amount)

    previous_period = @user.transactions
                           .joins(:category)
                           .where(date: (@end_date - 2.months)..(@end_date - 1.month))
                           .group('categories.name', 'categories.id')
                           .sum(:amount)

    trends = {}
    current_period.each do |(cat_name, cat_id), current_amount|
      previous_key = previous_period.keys.find { |key| key[1] == cat_id }
      previous_amount = previous_key ? previous_period[previous_key] : 0

      change_percent = if previous_amount.abs > 0
                         ((current_amount.abs - previous_amount.abs) / previous_amount.abs * 100).round(1)
                       else
                         current_amount.abs > 0 ? 100.0 : 0.0
                       end

      trends[cat_name] = {
        id: cat_id,
        current_amount: current_amount.abs,
        previous_amount: previous_amount.abs,
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
    Date.parse(date_string) if date_string.present?
  rescue Date::Error, ArgumentError
    nil
  end
end
