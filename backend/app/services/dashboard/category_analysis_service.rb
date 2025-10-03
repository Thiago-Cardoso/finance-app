# frozen_string_literal: true

module Dashboard
  # Service to analyze top expense categories with percentages
  class CategoryAnalysisService
    def initialize(user, start_date, end_date)
      @user = user
      @start_date = start_date
      @end_date = end_date
    end

    def call
      @user.transactions
           .joins(:category)
           .where(transaction_type: 'expense', date: @start_date..@end_date)
           .group('categories.id', 'categories.name', 'categories.color', 'categories.icon')
           .sum(:amount)
           .map { |key, amount| format_category(key, amount) }
           .sort_by { |cat| -cat[:amount] }
           .first(5)
    end

    private

    def format_category(key, amount)
      id, name, color, icon = key
      {
        category_id: id,
        category_name: name,
        color: color,
        icon: icon,
        amount: amount.to_f,
        percentage: calculate_percentage(amount)
      }
    end

    def calculate_percentage(amount)
      total = total_expenses
      return 0 if total.zero?

      ((amount / total) * 100).round(2)
    end

    def total_expenses
      @total_expenses ||= @user.transactions
                               .where(transaction_type: 'expense', date: @start_date..@end_date)
                               .sum(:amount)
    end
  end
end
