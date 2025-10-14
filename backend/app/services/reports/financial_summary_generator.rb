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
        accounts: scoped_accounts.includes(:transactions),
        categories: scoped_categories.includes(:transactions)
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

      breakdown = income_transactions
        .group(:category_id)
        .select('category_id, SUM(amount) as total, COUNT(*) as count')
        .includes(:category)
        .map do |record|
          category = record.category
          {
            category_id: category&.id,
            category_name: category&.name || 'Sem Categoria',
            total: record.total,
            total_formatted: format_currency(record.total),
            count: record.count,
            percentage: calculate_percentage(record.total, total_income)
          }
        end
        .sort_by { |item| -item[:total] }

      {
        total: total_income,
        total_formatted: format_currency(total_income),
        breakdown: breakdown
      }
    end

    def calculate_expense_breakdown(transactions)
      expense_transactions = transactions.where(transaction_type: 'expense')
      total_expenses = expense_transactions.sum(:amount)

      breakdown = expense_transactions
        .group(:category_id)
        .select('category_id, SUM(amount) as total, COUNT(*) as count')
        .includes(:category)
        .map do |record|
          category = record.category
          {
            category_id: category&.id,
            category_name: category&.name || 'Sem Categoria',
            total: record.total,
            total_formatted: format_currency(record.total),
            count: record.count,
            percentage: calculate_percentage(record.total, total_expenses)
          }
        end
        .sort_by { |item| -item[:total] }

      {
        total: total_expenses,
        total_formatted: format_currency(total_expenses),
        breakdown: breakdown
      }
    end

    def calculate_category_analysis(transactions)
      transactions
        .group(:category_id, :transaction_type)
        .select('category_id, transaction_type, SUM(amount) as total, COUNT(*) as count')
        .includes(:category)
        .group_by { |record| record.category }
        .map do |category, records|
          category_total = records.sum(&:total)
          {
            category_id: category&.id,
            category_name: category&.name || 'Sem Categoria',
            category_type: category&.category_type,
            total: category_total,
            total_formatted: format_currency(category_total),
            transaction_count: records.sum(&:count),
            breakdown: records.map do |record|
              {
                transaction_type: record.transaction_type,
                total: record.total,
                total_formatted: format_currency(record.total),
                count: record.count
              }
            end
          }
        end
        .sort_by { |item| -item[:total] }
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
      daily_data = transactions
        .group("DATE(date)", :transaction_type)
        .select("DATE(date) as date, transaction_type, SUM(amount) as total")
        .group_by { |record| record.date }

      (start_date..end_date).map do |date|
        date_records = daily_data[date] || []
        income = date_records.find { |r| r.transaction_type == 'income' }&.total || 0
        expenses = date_records.find { |r| r.transaction_type == 'expense' }&.total || 0

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
      # Compare with previous period
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
