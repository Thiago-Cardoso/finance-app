# app/services/reports/financial_summary_generator.rb
module Reports
  class FinancialSummaryGenerator < BaseGenerator
    def report_name
      "Resumo Financeiro - #{start_date.strftime('%d/%m/%Y')} a #{end_date.strftime('%d/%m/%Y')}"
    end

    def report_type
      :financial_summary
    end

    def fetch_data
      {
        transactions: scoped_transactions.includes(:category, :account),
        accounts: scoped_accounts,
        categories: scoped_categories
      }
    end

    def process_data(data)
      transactions = data[:transactions]

      {
        summary: calculate_summary(transactions),
        income_breakdown: calculate_income_breakdown(transactions),
        expense_breakdown: calculate_expense_breakdown(transactions),
        category_analysis: calculate_category_analysis(transactions),
        account_balances: calculate_account_balances(data[:accounts]),
        daily_trend: calculate_daily_trend(transactions),
        comparisons: calculate_comparisons(transactions)
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
        summary: processed_data[:summary],
        income: processed_data[:income_breakdown],
        expenses: processed_data[:expense_breakdown],
        categories: processed_data[:category_analysis],
        accounts: processed_data[:account_balances],
        trends: processed_data[:daily_trend],
        comparisons: processed_data[:comparisons],
        generated_at: @report.generated_at
      }
    end

    private

    def calculate_summary(transactions)
      income_transactions = transactions.where(transaction_type: 'income')
      expense_transactions = transactions.where(transaction_type: 'expense')

      total_income = income_transactions.sum(:amount)
      total_expenses = expense_transactions.sum(:amount)
      net_balance = total_income - total_expenses

      {
        total_income: total_income,
        total_income_formatted: format_currency(total_income),
        total_expenses: total_expenses,
        total_expenses_formatted: format_currency(total_expenses),
        net_balance: net_balance,
        net_balance_formatted: format_currency(net_balance),
        transaction_count: transactions.count,
        income_count: income_transactions.count,
        expense_count: expense_transactions.count,
        average_income: income_transactions.count.positive? ? (total_income / income_transactions.count) : 0,
        average_expense: expense_transactions.count.positive? ? (total_expenses / expense_transactions.count) : 0
      }
    end

    def calculate_income_breakdown(transactions)
      income_transactions = transactions.where(transaction_type: 'income')
      total_income = income_transactions.sum(:amount)

      # Fixed: Use proper grouping without non-aggregated columns
      breakdown_data = income_transactions
        .group(:category_id)
        .sum(:amount)

      breakdown = breakdown_data.map do |category_id, total|
        category = Category.find_by(id: category_id)
        {
          category_id: category_id,
          category_name: category&.name || 'Sem Categoria',
          total: total,
          total_formatted: format_currency(total),
          count: income_transactions.where(category_id: category_id).count,
          percentage: calculate_percentage(total, total_income)
        }
      end.sort_by { |item| -item[:total] }

      {
        total: total_income,
        total_formatted: format_currency(total_income),
        breakdown: breakdown
      }
    end

    def calculate_expense_breakdown(transactions)
      expense_transactions = transactions.where(transaction_type: 'expense')
      total_expenses = expense_transactions.sum(:amount)

      # Fixed: Use proper grouping without non-aggregated columns
      breakdown_data = expense_transactions
        .group(:category_id)
        .sum(:amount)

      breakdown = breakdown_data.map do |category_id, total|
        category = Category.find_by(id: category_id)
        {
          category_id: category_id,
          category_name: category&.name || 'Sem Categoria',
          total: total,
          total_formatted: format_currency(total),
          count: expense_transactions.where(category_id: category_id).count,
          percentage: calculate_percentage(total, total_expenses)
        }
      end.sort_by { |item| -item[:total] }

      {
        total: total_expenses,
        total_formatted: format_currency(total_expenses),
        breakdown: breakdown
      }
    end

    def calculate_category_analysis(transactions)
      # Fixed: Use separate queries for each transaction type
      categories_data = {}
      
      # Get all categories with their transactions
      Category.where(id: transactions.select(:category_id).distinct).each do |category|
        category_transactions = transactions.where(category_id: category.id)
        categories_data[category.id] = {
          category_id: category.id,
          category_name: category.name,
          category_type: category.category_type,
          total: category_transactions.sum(:amount),
          transaction_count: category_transactions.count,
          breakdown: {
            income: {
              total: category_transactions.where(transaction_type: 'income').sum(:amount),
              count: category_transactions.where(transaction_type: 'income').count
            },
            expense: {
              total: category_transactions.where(transaction_type: 'expense').sum(:amount),
              count: category_transactions.where(transaction_type: 'expense').count
            }
          }
        }
      end

      # Handle uncategorized transactions
      uncategorized_transactions = transactions.where(category_id: nil)
      if uncategorized_transactions.any?
        categories_data['uncategorized'] = {
          category_id: nil,
          category_name: 'Sem Categoria',
          category_type: 'uncategorized',
          total: uncategorized_transactions.sum(:amount),
          transaction_count: uncategorized_transactions.count,
          breakdown: {
            income: {
              total: uncategorized_transactions.where(transaction_type: 'income').sum(:amount),
              count: uncategorized_transactions.where(transaction_type: 'income').count
            },
            expense: {
              total: uncategorized_transactions.where(transaction_type: 'expense').sum(:amount),
              count: uncategorized_transactions.where(transaction_type: 'expense').count
            }
          }
        }
      end

      categories_data.values.map do |data|
        data[:total_formatted] = format_currency(data[:total])
        data[:breakdown] = data[:breakdown].map do |transaction_type, breakdown_data|
          {
            transaction_type: transaction_type,
            total: breakdown_data[:total],
            total_formatted: format_currency(breakdown_data[:total]),
            count: breakdown_data[:count]
          }
        end
        data
      end.sort_by { |item| -item[:total] }
    end

    def calculate_account_balances(accounts)
      accounts.map do |account|
        {
          account_id: account.id,
          account_name: account.name,
          account_type: account.account_type,
          current_balance: account.current_balance,
          current_balance_formatted: format_currency(account.current_balance),
          initial_balance: account.initial_balance,
          initial_balance_formatted: format_currency(account.initial_balance)
        }
      end
    end

    def calculate_daily_trend(transactions)
      # Fixed: Use separate queries for income and expenses
      income_by_date = transactions.where(transaction_type: 'income').group("DATE(date)").sum(:amount)
      expenses_by_date = transactions.where(transaction_type: 'expense').group("DATE(date)").sum(:amount)

      (start_date..end_date).map do |date|
        income = income_by_date[date] || 0
        expenses = expenses_by_date[date] || 0

        {
          date: date,
          date_formatted: date.strftime('%d/%m/%Y'),
          income: income,
          income_formatted: format_currency(income),
          expenses: expenses,
          expenses_formatted: format_currency(expenses),
          net: income - expenses,
          net_formatted: format_currency(income - expenses)
        }
      end
    end

    def calculate_comparisons(transactions)
      period_days = (end_date - start_date).to_i + 1
      previous_start = start_date - period_days.days
      previous_end = start_date - 1.day

      previous_transactions = user.transactions.where(date: previous_start..previous_end)

      current_income = transactions.where(transaction_type: 'income').sum(:amount)
      current_expenses = transactions.where(transaction_type: 'expense').sum(:amount)

      previous_income = previous_transactions.where(transaction_type: 'income').sum(:amount)
      previous_expenses = previous_transactions.where(transaction_type: 'expense').sum(:amount)

      {
        current_period: {
          start_date: start_date,
          end_date: end_date,
          income: current_income,
          income_formatted: format_currency(current_income),
          expenses: current_expenses,
          expenses_formatted: format_currency(current_expenses),
          net: current_income - current_expenses,
          net_formatted: format_currency(current_income - current_expenses)
        },
        previous_period: {
          start_date: previous_start,
          end_date: previous_end,
          income: previous_income,
          income_formatted: format_currency(previous_income),
          expenses: previous_expenses,
          expenses_formatted: format_currency(previous_expenses),
          net: previous_income - previous_expenses,
          net_formatted: format_currency(previous_income - previous_expenses)
        },
        changes: {
          income_change: current_income - previous_income,
          income_change_formatted: format_currency(current_income - previous_income),
          income_change_percentage: calculate_percentage(current_income - previous_income, previous_income),
          expenses_change: current_expenses - previous_expenses,
          expenses_change_formatted: format_currency(current_expenses - previous_expenses),
          expenses_change_percentage: calculate_percentage(current_expenses - previous_expenses, previous_expenses),
          net_change: (current_income - current_expenses) - (previous_income - previous_expenses),
          net_change_formatted: format_currency((current_income - current_expenses) - (previous_income - previous_expenses))
        }
      }
    end
  end
end