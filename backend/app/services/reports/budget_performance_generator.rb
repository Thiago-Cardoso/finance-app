module Reports
  class BudgetPerformanceGenerator < BaseGenerator
    def report_name
      "Performance de Orçamento - #{start_date.strftime('%d/%m/%Y')} a #{end_date.strftime('%d/%m/%Y')}"
    end

    def report_type
      :budget_performance
    end

    def fetch_data
      {
        budgets: user.budgets.active.includes(:category),
        transactions: scoped_transactions.includes(:category)
      }
    end

    def process_data(data)
      budgets = data[:budgets]
      transactions = data[:transactions]

      {
        overall_performance: calculate_overall_performance(budgets, transactions),
        budget_details: calculate_budget_details(budgets, transactions),
        category_performance: calculate_category_performance(budgets, transactions),
        alerts: generate_alerts(budgets, transactions)
      }
    end

    def format_result(processed_data)
      {
        report_id: @report.id,
        period: {
          start_date: start_date,
          end_date: end_date,
          period_type: period_type
        },
        overall: processed_data[:overall_performance],
        budgets: processed_data[:budget_details],
        categories: processed_data[:category_performance],
        alerts: processed_data[:alerts],
        generated_at: @report.generated_at
      }
    end

    private

    def calculate_overall_performance(budgets, transactions)
      total_budget = budgets.sum(:amount)
      total_spent = transactions.where(transaction_type: 'expense').sum(:amount)

      remaining = total_budget - total_spent
      usage_percentage = calculate_percentage(total_spent, total_budget)

      {
        total_budget: total_budget,
        total_budget_formatted: format_currency(total_budget),
        total_spent: total_spent,
        total_spent_formatted: format_currency(total_spent),
        remaining: remaining,
        remaining_formatted: format_currency(remaining),
        usage_percentage: usage_percentage,
        status: determine_status(usage_percentage),
        budget_count: budgets.count,
        over_budget_count: count_over_budget(budgets, transactions)
      }
    end

    def calculate_budget_details(budgets, transactions)
      budgets.map do |budget|
        spent = calculate_spent_for_budget(budget, transactions)
        remaining = budget.amount - spent
        usage_percentage = calculate_percentage(spent, budget.amount)

        {
          budget_id: budget.id,
          budget_name: budget.name,
          category_id: budget.category_id,
          category_name: budget.category&.name,
          period_type: budget.period_type,
          amount: budget.amount,
          amount_formatted: format_currency(budget.amount),
          spent: spent,
          spent_formatted: format_currency(spent),
          remaining: remaining,
          remaining_formatted: format_currency(remaining),
          usage_percentage: usage_percentage,
          status: determine_status(usage_percentage),
          is_exceeded: spent > budget.amount,
          exceeded_by: spent > budget.amount ? spent - budget.amount : 0,
          exceeded_by_formatted: spent > budget.amount ? format_currency(spent - budget.amount) : format_currency(0),
          daily_average: calculate_daily_average(spent),
          projected_end: project_end_of_period(spent, budget.amount)
        }
      end.sort_by { |b| -b[:usage_percentage] }
    end

    def calculate_category_performance(budgets, transactions)
      expense_transactions = transactions.where(transaction_type: 'expense')

      budgets.group_by(&:category).map do |category, category_budgets|
        next if category.nil?

        total_budget = category_budgets.sum(&:amount)
        category_spent = expense_transactions.where(category_id: category.id).sum(:amount)
        remaining = total_budget - category_spent
        usage_percentage = calculate_percentage(category_spent, total_budget)

        {
          category_id: category.id,
          category_name: category.name,
          category_type: category.category_type,
          total_budget: total_budget,
          total_budget_formatted: format_currency(total_budget),
          spent: category_spent,
          spent_formatted: format_currency(category_spent),
          remaining: remaining,
          remaining_formatted: format_currency(remaining),
          usage_percentage: usage_percentage,
          status: determine_status(usage_percentage),
          transaction_count: expense_transactions.where(category_id: category.id).count,
          budget_count: category_budgets.count
        }
      end.compact.sort_by { |c| -c[:usage_percentage] }
    end

    def generate_alerts(budgets, transactions)
      alerts = []

      budgets.each do |budget|
        spent = calculate_spent_for_budget(budget, transactions)
        usage_percentage = calculate_percentage(spent, budget.amount)

        # Over budget alert
        if spent > budget.amount
          alerts << {
            type: 'danger',
            level: 'critical',
            budget_id: budget.id,
            budget_name: budget.name,
            message: "Orçamento excedido em #{format_currency(spent - budget.amount)}",
            usage_percentage: usage_percentage
          }
        # 90% warning
        elsif usage_percentage >= 90
          alerts << {
            type: 'warning',
            level: 'high',
            budget_id: budget.id,
            budget_name: budget.name,
            message: "#{usage_percentage}% do orçamento utilizado",
            usage_percentage: usage_percentage
          }
        # 75% info
        elsif usage_percentage >= 75
          alerts << {
            type: 'info',
            level: 'medium',
            budget_id: budget.id,
            budget_name: budget.name,
            message: "#{usage_percentage}% do orçamento utilizado",
            usage_percentage: usage_percentage
          }
        end
      end

      alerts.sort_by { |a| -a[:usage_percentage] }
    end

    def calculate_spent_for_budget(budget, transactions)
      query = transactions.where(transaction_type: 'expense')

      if budget.category_id.present?
        query = query.where(category_id: budget.category_id)
      end

      query.sum(:amount)
    end

    def determine_status(usage_percentage)
      case usage_percentage
      when 0..50
        'safe'
      when 50..75
        'moderate'
      when 75..90
        'warning'
      when 90..100
        'critical'
      else
        'exceeded'
      end
    end

    def count_over_budget(budgets, transactions)
      budgets.count do |budget|
        spent = calculate_spent_for_budget(budget, transactions)
        spent > budget.amount
      end
    end

    def calculate_daily_average(spent)
      period_days = (end_date - start_date).to_i + 1
      return 0 if period_days.zero?

      (spent / period_days).round(2)
    end

    def project_end_of_period(spent, budget_amount)
      daily_average = calculate_daily_average(spent)
      return nil if daily_average.zero?

      remaining = budget_amount - spent
      days_remaining = (remaining / daily_average).round

      if days_remaining.positive?
        projected_date = Date.current + days_remaining.days
        {
          days_remaining: days_remaining,
          projected_date: projected_date,
          projected_date_formatted: projected_date.strftime('%d/%m/%Y'),
          will_exceed: projected_date < end_date
        }
      else
        {
          days_remaining: 0,
          projected_date: Date.current,
          projected_date_formatted: Date.current.strftime('%d/%m/%Y'),
          will_exceed: true
        }
      end
    end
  end
end
