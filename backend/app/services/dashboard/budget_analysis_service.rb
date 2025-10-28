# frozen_string_literal: true

module Dashboard
  # Service to analyze budget status and spending patterns
  class BudgetAnalysisService
    SAFE_THRESHOLD = 60
    WARNING_THRESHOLD = 80
    DANGER_THRESHOLD = 100

    def initialize(user)
      @user = user
    end

    def call
      current_budgets.map { |budget| analyze_budget(budget) }
    end

    private

    def current_budgets
      @user.budgets
           .includes(:category)
           .where(is_active: true)
           .where('start_date <= ? AND end_date >= ?', Date.current, Date.current)
    end

    def analyze_budget(budget)
      spent = calculate_spent(budget)
      percentage_used = calculate_percentage(spent, budget.amount)

      {
        budget_id: budget.id,
        category: format_category(budget.category),
        limit: budget.amount.to_f,
        spent: spent.to_f,
        remaining: (budget.amount - spent).to_f,
        percentage_used: percentage_used,
        status: determine_status(percentage_used)
      }
    end

    def calculate_spent(budget)
      @user.transactions
           .where(category: budget.category)
           .where(transaction_type: 'expense')
           .where(date: budget.start_date..budget.end_date)
           .sum(:amount)
    end

    def calculate_percentage(spent, limit)
      return 0.0 if limit.zero?

      ((spent.to_f / limit.to_f) * 100).round(2)
    end

    def format_category(category)
      {
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon
      }
    end

    def determine_status(percentage)
      case percentage
      when 0..SAFE_THRESHOLD then 'safe'
      when (SAFE_THRESHOLD + 1)..WARNING_THRESHOLD then 'warning'
      when (WARNING_THRESHOLD + 1)..DANGER_THRESHOLD then 'danger'
      else 'exceeded'
      end
    end
  end
end
