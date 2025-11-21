/**
 * Dashboard Models
 *
 * Re-exports types from shared types to maintain compatibility.
 * These types are shared with the frontend project.
 */

// Re-export analytics types
export type {
  FinancialSummary,
  CategoryBreakdown,
  BudgetDetail,
  BudgetPerformance,
  DashboardData,
  TimeSeriesData,
  TrendAnalysis,
  AnalyticsFilters,
  AnalyticsResponse,
} from '@/shared/types/analytics';

// Re-export transaction types for recent transactions
export type {
  Transaction,
  TransactionFormData,
  TransactionFilters,
  TransactionsResponse,
  TransactionResponse,
  Category,
  Account,
} from '@/shared/types/transaction';

/**
 * Simplified transaction for dashboard list
 * Used for displaying recent transactions in the dashboard
 */
export interface RecentTransaction {
  id: string | number;
  description: string;
  amount: number;
  transaction_type: 'income' | 'expense';
  category_name: string;
  category_icon?: string;
  date: string;
  account_name: string;
}

/**
 * Dashboard data structure from API
 * Adapts API response to match frontend types
 */
export interface DashboardApiResponse {
  summary: FinancialSummary;
  categories_breakdown?: CategoryBreakdown[];
  budget_progress?: BudgetDetail[];
  recent_transactions?: RecentTransaction[];
  period?: string;
}
