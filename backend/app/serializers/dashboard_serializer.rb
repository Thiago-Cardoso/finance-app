# frozen_string_literal: true

# Serializer for dashboard data formatting and presentation
class DashboardSerializer
  def initialize(dashboard_data)
    @data = dashboard_data
  end

  def as_json
    {
      summary: @data[:summary],
      current_balance: format_currency(@data[:current_balance]),
      recent_transactions: @data[:recent_transactions],
      top_categories: format_categories(@data[:top_categories]),
      monthly_evolution: format_evolution(@data[:monthly_evolution]),
      budget_status: format_budgets(@data[:budget_status]),
      goals_progress: @data[:goals_progress],
      last_updated: Time.current.iso8601
    }
  end

  private

  def format_currency(amount)
    CurrencyFormatter.format_with_raw(amount)
  end

  def format_categories(categories)
    return [] if categories.blank?

    categories.map do |category|
      category.merge(
        formatted_amount: CurrencyFormatter.format(category[:amount])
      )
    end
  end

  def format_evolution(evolution)
    return [] if evolution.blank?

    evolution.map do |month|
      month.merge(
        formatted_income: CurrencyFormatter.format(month[:income]),
        formatted_expenses: CurrencyFormatter.format(month[:expenses]),
        formatted_balance: CurrencyFormatter.format(month[:balance])
      )
    end
  end

  def format_budgets(budgets)
    return [] if budgets.blank?

    budgets.map do |budget|
      budget.merge(
        formatted_limit: CurrencyFormatter.format(budget[:limit]),
        formatted_spent: CurrencyFormatter.format(budget[:spent]),
        formatted_remaining: CurrencyFormatter.format(budget[:remaining])
      )
    end
  end
end
