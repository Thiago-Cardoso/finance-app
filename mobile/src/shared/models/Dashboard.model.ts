/**
 * Dashboard Models
 *
 * Re-exports types from shared types to maintain compatibility.
 * These types are shared with the frontend project.
 */

// Import and re-export analytics types
import type {
  FinancialSummary as FinancialSummaryType,
  CategoryBreakdown as CategoryBreakdownType,
  BudgetDetail as BudgetDetailType,
  BudgetPerformance as BudgetPerformanceType,
  AnalyticsFilters as AnalyticsFiltersType,
} from '@/shared/types/analytics';

export type FinancialSummary = FinancialSummaryType;
export type CategoryBreakdown = CategoryBreakdownType;
export type BudgetDetail = BudgetDetailType;
export type BudgetPerformance = BudgetPerformanceType;
export type AnalyticsFilters = AnalyticsFiltersType;

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
