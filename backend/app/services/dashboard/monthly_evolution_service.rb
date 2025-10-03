# frozen_string_literal: true

module Dashboard
  # Service to calculate monthly financial evolution over time
  class MonthlyEvolutionService
    def initialize(user)
      @user = user
    end

    def call
      5.downto(0).map { |months_ago| month_data(months_ago) }
    end

    private

    def month_data(months_ago)
      month_start = Date.current.beginning_of_month - months_ago.months
      month_end = Date.current.end_of_month - months_ago.months

      financial_data = calculate_month_financials(month_start, month_end)

      {
        month: month_start.strftime('%Y-%m'),
        month_name: I18n.l(month_start, format: '%B %Y')
      }.merge(financial_data)
    end

    def calculate_month_financials(start_date, end_date)
      transactions = @user.transactions.where(date: start_date..end_date)
      income = transactions.where(transaction_type: 'income').sum(:amount)
      expenses = transactions.where(transaction_type: 'expense').sum(:amount)

      {
        income: income.to_f,
        expenses: expenses.to_f,
        balance: (income - expenses).to_f
      }
    end
  end
end
