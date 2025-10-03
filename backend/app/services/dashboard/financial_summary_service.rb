# frozen_string_literal: true

module Dashboard
  # Service to calculate financial summary with current/previous month comparison
  class FinancialSummaryService
    def initialize(user, start_date, end_date)
      @user = user
      @start_date = start_date
      @end_date = end_date
    end

    def call
      {
        current_month: current_month_data,
        previous_month: previous_month_data,
        variation: calculate_variation
      }
    end

    private

    def current_month_data
      transactions = @user.transactions.where(date: @start_date..@end_date)
      income = transactions.where(transaction_type: 'income').sum(:amount)
      expenses = transactions.where(transaction_type: 'expense').sum(:amount)

      {
        income: income.to_f,
        expenses: expenses.to_f,
        balance: (income - expenses).to_f,
        transactions_count: transactions.count
      }
    end

    def previous_month_data
      previous_start = @start_date - 1.month
      previous_end = @end_date - 1.month

      transactions = @user.transactions.where(date: previous_start..previous_end)
      income = transactions.where(transaction_type: 'income').sum(:amount)
      expenses = transactions.where(transaction_type: 'expense').sum(:amount)

      {
        income: income.to_f,
        expenses: expenses.to_f,
        balance: (income - expenses).to_f
      }
    end

    def calculate_variation
      current_balance = current_month_data[:balance]
      previous_balance = previous_month_data[:balance]

      return { percentage: 0, trend: 'stable', amount: 0 } if previous_balance.zero?

      variation = ((current_balance - previous_balance) / previous_balance * 100).round(2)
      {
        percentage: variation,
        trend: determine_trend(variation),
        amount: (current_balance - previous_balance).to_f
      }
    end

    def determine_trend(variation)
      if variation.positive?
        'up'
      else
        (variation.negative? ? 'down' : 'stable')
      end
    end
  end
end
