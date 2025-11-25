/**
 * Tests for analytics.service
 */

import { apiClient } from '../client';
import {
  getFinancialSummary,
  getBudgetPerformance,
  transformToBalanceEvolution,
  getDateRangeForPeriod,
} from '../analytics.service';
import type { AnalyticsFilters, MonthlyBreakdown } from '@/shared/types/analytics';

// Mock the API client
jest.mock('../client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockFinancialSummaryResponse = {
  data: {
    data: {
      period: {
        start_date: '2024-11-01',
        end_date: '2024-11-30',
        period_type: 'monthly',
      },
      summary: {
        total_income: 8500.0,
        total_expenses: 4250.75,
        net_balance: 4249.25,
        transaction_count: 25,
      },
      monthly_breakdown: [],
      category_breakdown: [],
      generated_at: '2024-11-23T10:00:00Z',
    },
  },
};

const mockBudgetPerformanceResponse = {
  data: {
    data: {
      period: {
        start_date: '2024-11-01',
        end_date: '2024-11-30',
        period_type: 'monthly',
      },
      overall: {
        total_budget: 5000,
        total_spent: 4250.75,
        remaining: 749.25,
        usage_percentage: 85.0,
        status: 'warning',
        budget_count: 3,
        over_budget_count: 0,
      },
      budgets: [],
      generated_at: '2024-11-23T10:00:00Z',
    },
  },
};

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFinancialSummary', () => {
    it('should fetch financial summary with default filters', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockFinancialSummaryResponse);

      const result = await getFinancialSummary();

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/analytics/financial_summary',
        { params: { period_type: 'monthly' } }
      );
      expect(result).toEqual(mockFinancialSummaryResponse.data.data);
    });

    it('should fetch financial summary with custom filters', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockFinancialSummaryResponse);

      const filters: AnalyticsFilters = {
        period_type: 'yearly',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        category_ids: [1, 2, 3],
        transaction_type: 'expense',
      };

      await getFinancialSummary(filters);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/analytics/financial_summary',
        {
          params: {
            period_type: 'yearly',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            category_ids: '1,2,3',
            transaction_type: 'expense',
          },
        }
      );
    });

    it('should throw error on API failure', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(getFinancialSummary()).rejects.toThrow('Network error');
    });
  });

  describe('getBudgetPerformance', () => {
    it('should fetch budget performance with default filters', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockBudgetPerformanceResponse);

      const result = await getBudgetPerformance();

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/analytics/budget_performance',
        { params: { period_type: 'monthly' } }
      );
      expect(result).toEqual(mockBudgetPerformanceResponse.data.data);
    });

    it('should throw error on API failure', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(getBudgetPerformance()).rejects.toThrow('Network error');
    });
  });

  describe('transformToBalanceEvolution', () => {
    it('should transform monthly breakdown to balance data points', () => {
      const monthlyBreakdown: MonthlyBreakdown[] = [
        { month: '2024-09', month_name: 'Set', income: 7000, expense: 4000, net: 3000 },
        { month: '2024-10', month_name: 'Out', income: 7500, expense: 4500, net: 3000 },
        { month: '2024-11', month_name: 'Nov', income: 8500, expense: 4250, net: 4250 },
      ];

      const result = transformToBalanceEvolution(monthlyBreakdown, 0);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        date: '2024-09',
        label: 'Set',
        balance: 3000,
        income: 7000,
        expense: 4000,
      });
      expect(result[1]).toEqual({
        date: '2024-10',
        label: 'Out',
        balance: 6000, // 3000 + 3000
        income: 7500,
        expense: 4500,
      });
      expect(result[2]).toEqual({
        date: '2024-11',
        label: 'Nov',
        balance: 10250, // 6000 + 4250
        income: 8500,
        expense: 4250,
      });
    });

    it('should use initial balance', () => {
      const monthlyBreakdown: MonthlyBreakdown[] = [
        { month: '2024-11', month_name: 'Nov', income: 5000, expense: 3000, net: 2000 },
      ];

      const result = transformToBalanceEvolution(monthlyBreakdown, 10000);

      expect(result[0].balance).toBe(12000); // 10000 + 2000
    });

    it('should handle empty array', () => {
      const result = transformToBalanceEvolution([], 0);
      expect(result).toEqual([]);
    });
  });

  describe('getDateRangeForPeriod', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-11-15'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should return current month range for monthly', () => {
      const result = getDateRangeForPeriod('monthly');

      expect(result.startDate).toBe('2024-11-01');
      expect(result.endDate).toBe('2024-11-30');
    });

    it('should return current quarter range for quarterly', () => {
      const result = getDateRangeForPeriod('quarterly');

      expect(result.startDate).toBe('2024-10-01');
      expect(result.endDate).toBe('2024-12-31');
    });

    it('should return current year range for yearly', () => {
      const result = getDateRangeForPeriod('yearly');

      expect(result.startDate).toBe('2024-01-01');
      expect(result.endDate).toBe('2024-12-31');
    });

    it('should default to monthly for unknown period types', () => {
      const result = getDateRangeForPeriod('unknown' as any);

      expect(result.startDate).toBe('2024-11-01');
      expect(result.endDate).toBe('2024-11-30');
    });
  });
});
