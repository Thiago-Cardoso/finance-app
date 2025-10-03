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
    {
      raw: amount,
      formatted: format_brazilian_currency(amount)
    }
  end

  def format_categories(categories)
    return [] if categories.blank?

    categories.map do |category|
      category.merge(
        formatted_amount: format_brazilian_currency(category[:amount])
      )
    end
  end

  def format_evolution(evolution)
    return [] if evolution.blank?

    evolution.map do |month|
      month.merge(
        formatted_income: format_brazilian_currency(month[:income]),
        formatted_expenses: format_brazilian_currency(month[:expenses]),
        formatted_balance: format_brazilian_currency(month[:balance])
      )
    end
  end

  def format_budgets(budgets)
    return [] if budgets.blank?

    budgets.map do |budget|
      budget.merge(
        formatted_limit: format_brazilian_currency(budget[:limit]),
        formatted_spent: format_brazilian_currency(budget[:spent]),
        formatted_remaining: format_brazilian_currency(budget[:remaining])
      )
    end
  end

  def format_brazilian_currency(amount)
    # Format as Brazilian currency (R$ 1.234,56)
    integer_part = amount.to_i.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1.').reverse
    decimal_part = format('%.2f', amount).split('.').last

    "R$ #{integer_part},#{decimal_part}"
  end
end
