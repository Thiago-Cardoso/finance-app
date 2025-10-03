# frozen_string_literal: true

module Dashboard
  # Service to analyze budget status and spending patterns
  class BudgetAnalysisService
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
      percentage_used = calculate_percentage(spent, budget.amount_limit)

      {
        budget_id: budget.id,
        category: format_category(budget.category),
        limit: budget.amount_limit.to_f,
        spent: spent.to_f,
        remaining: (budget.amount_limit - spent).to_f,
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
      return 0 if limit.zero?

      (spent / limit * 100).round(2)
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
      when 0..60 then 'safe'
      when 61..80 then 'warning'
      when 81..100 then 'danger'
      else 'exceeded'
      end
    end
  end
end
