# frozen_string_literal: true

# Service for dashboard data aggregation and calculations
# Orchestrates specialized services for different dashboard components
class DashboardService
  def initialize(user, params = {})
    @user = user
    @period = params[:period] || 'current_month'
    @start_date = parse_date(params[:start_date]) || Date.current.beginning_of_month
    @end_date = parse_date(params[:end_date]) || Date.current.end_of_month
  end

  def call
    Rails.cache.fetch(cache_key, expires_in: 15.minutes) do
      {
        summary: financial_summary,
        current_balance: total_balance,
        recent_transactions: recent_transactions,
        top_categories: top_categories,
        monthly_evolution: monthly_evolution,
        budget_status: budget_status,
        goals_progress: goals_progress
      }
    end
  end

  private

  def cache_key
    [
      'dashboard',
      "user:#{@user.id}",
      "period:#{@period}",
      "dates:#{@start_date}:#{@end_date}",
      "transactions:#{last_transaction_update}",
      "accounts:#{last_account_update}",
      "budgets:#{last_budget_update}",
      "goals:#{last_goal_update}"
    ].join(':')
  end

  def last_transaction_update
    @user.transactions.maximum(:updated_at).to_i
  end

  def last_account_update
    @user.accounts.maximum(:updated_at).to_i
  end

  def last_budget_update
    @user.budgets.maximum(:updated_at).to_i
  end

  def last_goal_update
    @user.goals.maximum(:updated_at).to_i
  end

  def parse_date(date_string)
    return nil if date_string.blank?

    Date.parse(date_string.to_s)
  rescue ArgumentError
    nil
  end

  def financial_summary
    Dashboard::FinancialSummaryService.new(@user, @start_date, @end_date).call
  end

  def total_balance
    @user.accounts.where(is_active: true).sum(:current_balance).to_f
  end

  def recent_transactions
    @user.transactions
         .includes(:category, :account)
         .order(date: :desc, created_at: :desc)
         .limit(10)
         .map { |t| TransactionSerializer.new(t).as_json }
  end

  def top_categories
    Dashboard::CategoryAnalysisService.new(@user, @start_date, @end_date).call
  end

  def monthly_evolution
    Dashboard::MonthlyEvolutionService.new(@user).call
  end

  def budget_status
    Dashboard::BudgetAnalysisService.new(@user).call
  end

  def goals_progress
    Dashboard::GoalProgressService.new(@user).call
  end
end
