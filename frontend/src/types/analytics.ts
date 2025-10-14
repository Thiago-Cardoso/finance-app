// Analytics types for Financial Reports and Analytics features

import { Transaction } from './transaction'

// Filters interface for analytics queries
export interface AnalyticsFilters {
  period_type?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom_range' | 'all_time'
  start_date?: string
  end_date?: string
  category_id?: number
  category_ids?: number[]
  account_id?: number
  transaction_type?: 'income' | 'expense'
  min_amount?: number
  max_amount?: number
}

// Financial Summary interfaces
export interface FinancialSummary {
  report_id?: number
  period: {
    start_date: string
    end_date: string
    period_type: string
    days_count?: number
  }
  summary: {
    total_income: number
    total_income_formatted?: string
    total_expenses: number
    total_expenses_formatted?: string
    net_balance: number
    net_balance_formatted?: string
    transaction_count: number
    avg_income?: number
    avg_expense?: number
  }
  income?: {
    total: number
    total_formatted?: string
    breakdown: CategoryBreakdown[]
  }
  expenses?: {
    total: number
    total_formatted?: string
    breakdown: CategoryBreakdown[]
  }
  monthly_breakdown: MonthlyBreakdown[]
  category_breakdown: CategoryBreakdown[]
  accounts?: AccountSummary[]
  trends?: TrendData[]
  comparisons?: {
    previous_period?: PeriodComparison
    year_over_year?: PeriodComparison
  }
  top_transactions?: {
    expenses: Transaction[]
    incomes: Transaction[]
  }
  insights?: Insight[]
  generated_at: string
}

export interface CategoryBreakdown {
  category_id?: number
  category_name: string
  category_color?: string
  color?: string
  amount: number
  total?: number
  total_formatted?: string
  percentage: number
  transaction_count: number
  count?: number
}

export interface MonthlyBreakdown {
  month: string
  month_name: string
  income: number
  expense: number
  net: number
}

export interface AccountSummary {
  account_id: number
  account_name: string
  account_type: string
  current_balance: number
  total_income: number
  total_expenses: number
}

export interface TrendData {
  period: string
  income: number
  expense: number
  net: number
  growth_rate?: number
}

export interface PeriodComparison {
  total_income: number
  total_expenses: number
  net_amount: number
  transaction_count: number
  income_growth?: number
  expense_growth?: number
  net_growth?: number
}

export interface Insight {
  type: 'success' | 'warning' | 'info' | 'error'
  level?: 'high' | 'medium' | 'low'
  title: string
  message: string
  action?: string
}

// Budget Performance interfaces
export interface BudgetPerformance {
  report_id?: number
  period: {
    start_date: string
    end_date: string
    period_type: string
  }
  overall: {
    total_budget: number
    total_budget_formatted?: string
    total_spent: number
    total_spent_formatted?: string
    remaining: number
    remaining_formatted?: string
    usage_percentage: number
    status: 'healthy' | 'moderate' | 'warning' | 'critical'
    budget_count: number
    over_budget_count: number
  }
  budgets: BudgetDetail[]
  categories?: CategoryPerformance[]
  alerts?: BudgetAlert[]
  trends?: BudgetTrend[]
  recommendations?: Recommendation[]
  generated_at: string
}

export interface BudgetDetail {
  budget_id: number
  budget_name: string
  category_id?: number
  category_name?: string
  category_color?: string
  period_type: string
  amount: number
  amount_formatted?: string
  allocated_amount?: number
  spent: number
  spent_amount?: number
  spent_formatted?: string
  remaining: number
  remaining_amount?: number
  remaining_formatted?: string
  usage_percentage: number
  projected_usage?: number
  status: 'on_track' | 'over_budget' | 'critical' | 'ahead_of_schedule' | 'behind_schedule' | 'warning'
  is_exceeded?: boolean
  days_total?: number
  days_passed?: number
  days_remaining?: number
  daily_average?: number
  projected_total?: number
  performance_score?: number
}

export interface CategoryPerformance {
  category_id: number
  category_name: string
  category_color?: string
  budgeted_amount: number
  spent_amount: number
  remaining_amount: number
  usage_percentage: number
  performance_status: string
}

export interface BudgetAlert {
  type: 'warning' | 'critical' | 'info' | 'urgent' | 'success'
  level?: 'high' | 'medium' | 'low'
  budget_id?: number
  budget_name?: string
  category_name?: string
  message: string
  usage_percentage?: number
  actions?: string[]
}

export interface BudgetTrend {
  month: string
  month_name: string
  budgets: Array<{
    budget_name: string
    category_name?: string
    usage_percentage: number
  }>
  average_usage: number
}

export interface Recommendation {
  type: 'urgent' | 'warning' | 'success' | 'info'
  title: string
  message: string
  actions: string[]
}

// Trends Data interface
export interface TrendsData {
  income_trends: Array<{
    period: string
    amount: number
    growth_rate: number
  }>
  expense_trends: Array<{
    period: string
    amount: number
    growth_rate: number
  }>
  category_trends: Record<string, Array<{
    period: string
    amount: number
    percentage: number
  }>>
  savings_rate_trend: Array<{
    period: string
    rate: number
  }>
}

// API Response interfaces
export interface FinancialSummaryResponse {
  success: boolean
  data: FinancialSummary
  message?: string
}

export interface BudgetPerformanceResponse {
  success: boolean
  data: BudgetPerformance
  message?: string
}

export interface TrendsDataResponse {
  success: boolean
  data: TrendsData
  message?: string
}

export interface ReportListResponse {
  success: boolean
  data: ReportListItem[]
  pagination?: {
    current_page: number
    next_page: number | null
    prev_page: number | null
    total_pages: number
    total_count: number
  }
}

export interface ReportListItem {
  id: number
  name: string
  report_type: 'financial_summary' | 'budget_performance' | 'trends'
  period_type: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  filter_criteria: AnalyticsFilters
  generated_at: string
  created_at: string
}

// Export request interface
export interface ExportRequest {
  report_type: 'financial_summary' | 'budget_performance'
  format: 'pdf' | 'excel' | 'xlsx' | 'csv'
  filters: AnalyticsFilters
  name?: string
}
