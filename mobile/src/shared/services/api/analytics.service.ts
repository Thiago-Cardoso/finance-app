/**
 * Analytics Service
 *
 * Service to fetch analytics data for reports.
 * Endpoints: /api/v1/analytics/financial_summary, /api/v1/analytics/budget_performance
 */

import { apiClient } from './client';
import type {
  AnalyticsFilters,
  FinancialSummary,
  BudgetPerformance,
  FinancialSummaryResponse,
  BudgetPerformanceResponse,
  BalanceDataPoint,
  MonthlyBreakdown,
} from '@/shared/types/analytics';

/**
 * Build query params from filters
 */
function buildQueryParams(filters: AnalyticsFilters): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.period_type) {
    params.period_type = filters.period_type;
  }
  if (filters.start_date) {
    params.start_date = filters.start_date;
  }
  if (filters.end_date) {
    params.end_date = filters.end_date;
  }
  if (filters.category_id) {
    params.category_id = String(filters.category_id);
  }
  if (filters.category_ids && filters.category_ids.length > 0) {
    params.category_ids = filters.category_ids.join(',');
  }
  if (filters.account_id) {
    params.account_id = String(filters.account_id);
  }
  if (filters.transaction_type) {
    params.transaction_type = filters.transaction_type;
  }

  return params;
}

/**
 * Fetch financial summary report
 * @param filters - Analytics filters
 */
export async function getFinancialSummary(
  filters: AnalyticsFilters = { period_type: 'monthly' }
): Promise<FinancialSummary> {
  try {
    const params = buildQueryParams(filters);
    const response = await apiClient.get<FinancialSummaryResponse>(
      '/api/v1/analytics/financial_summary',
      { params }
    );

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching financial summary:', error);
    throw error;
  }
}

/**
 * Fetch budget performance report
 * @param filters - Analytics filters
 */
export async function getBudgetPerformance(
  filters: AnalyticsFilters = { period_type: 'monthly' }
): Promise<BudgetPerformance> {
  try {
    const params = buildQueryParams(filters);
    const response = await apiClient.get<BudgetPerformanceResponse>(
      '/api/v1/analytics/budget_performance',
      { params }
    );

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching budget performance:', error);
    throw error;
  }
}

/**
 * Transform monthly breakdown to balance evolution data
 * Calculates cumulative balance over time
 */
export function transformToBalanceEvolution(
  monthlyBreakdown: MonthlyBreakdown[],
  initialBalance: number = 0
): BalanceDataPoint[] {
  let cumulativeBalance = initialBalance;

  return monthlyBreakdown.map((item) => {
    cumulativeBalance += item.net;
    return {
      date: item.month,
      label: item.month_name,
      balance: cumulativeBalance,
      income: item.income,
      expense: item.expense,
    };
  });
}

/**
 * Get date range for period type
 */
export function getDateRangeForPeriod(
  periodType: AnalyticsFilters['period_type']
): { startDate: string; endDate: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (periodType) {
    case 'monthly': {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };
    }
    case 'quarterly': {
      const quarterStart = Math.floor(month / 3) * 3;
      const startDate = new Date(year, quarterStart, 1);
      const endDate = new Date(year, quarterStart + 3, 0);
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };
    }
    case 'yearly': {
      return {
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
      };
    }
    default:
      return {
        startDate: new Date(year, month, 1).toISOString().split('T')[0],
        endDate: new Date(year, month + 1, 0).toISOString().split('T')[0],
      };
  }
}

export default {
  getFinancialSummary,
  getBudgetPerformance,
  transformToBalanceEvolution,
  getDateRangeForPeriod,
};
