/**
 * Tests for useReport.viewModel
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useReportViewModel } from '../useReport.viewModel';
import * as analyticsService from '@/shared/services/api/analytics.service';

// Mock the analytics service
jest.mock('@/shared/services/api/analytics.service', () => ({
  getFinancialSummary: jest.fn(),
  getBudgetPerformance: jest.fn(),
  transformToBalanceEvolution: jest.fn(),
  getDateRangeForPeriod: jest.fn(),
}));

const mockFinancialSummary = {
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
  monthly_breakdown: [
    { month: '2024-10', month_name: 'Out', income: 7500, expense: 4000, net: 3500 },
    { month: '2024-11', month_name: 'Nov', income: 8500, expense: 4250.75, net: 4249.25 },
  ],
  category_breakdown: [
    {
      category_id: 1,
      category_name: 'Alimentação',
      category_color: '#FF6B6B',
      amount: 1250.5,
      percentage: 29.4,
      transaction_count: 12,
    },
    {
      category_id: 2,
      category_name: 'Transporte',
      category_color: '#4ECDC4',
      amount: 850.0,
      percentage: 20.0,
      transaction_count: 8,
    },
  ],
  generated_at: new Date().toISOString(),
};

const mockBudgetPerformance = {
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
  generated_at: new Date().toISOString(),
};

describe('useReportViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (analyticsService.getFinancialSummary as jest.Mock).mockResolvedValue(mockFinancialSummary);
    (analyticsService.getBudgetPerformance as jest.Mock).mockResolvedValue(mockBudgetPerformance);
    (analyticsService.transformToBalanceEvolution as jest.Mock).mockImplementation((data) => {
      let balance = 0;
      return data.map((item: any) => {
        balance += item.net;
        return {
          date: item.month,
          label: item.month_name,
          balance,
          income: item.income,
          expense: item.expense,
        };
      });
    });
  });

  describe('Initial State', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useReportViewModel());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.financialSummary).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should have default filters', () => {
      const { result } = renderHook(() => useReportViewModel());

      expect(result.current.filters.periodType).toBe('monthly');
      expect(result.current.filters.transactionType).toBe('all');
    });
  });

  describe('Data Loading', () => {
    it('should load financial summary on mount', async () => {
      const { result } = renderHook(() => useReportViewModel());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(analyticsService.getFinancialSummary).toHaveBeenCalled();
      expect(result.current.financialSummary).toEqual(mockFinancialSummary);
    });

    it('should load budget performance on mount', async () => {
      const { result } = renderHook(() => useReportViewModel());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(analyticsService.getBudgetPerformance).toHaveBeenCalled();
      expect(result.current.budgetPerformance).toEqual(mockBudgetPerformance);
    });

    it('should handle error when loading fails', async () => {
      (analyticsService.getFinancialSummary as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useReportViewModel());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.financialSummary).toBeNull();
    });

    it('should continue loading if budget performance fails', async () => {
      (analyticsService.getBudgetPerformance as jest.Mock).mockRejectedValue(
        new Error('Budget error')
      );

      const { result } = renderHook(() => useReportViewModel());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.financialSummary).toEqual(mockFinancialSummary);
      expect(result.current.budgetPerformance).toBeNull();
    });
  });

  describe('Data Transformation', () => {
    it('should transform monthly breakdown to bar chart data', async () => {
      const { result } = renderHook(() => useReportViewModel());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.monthlyChartData).toEqual([
        { label: 'Out', income: 7500, expense: 4000 },
        { label: 'Nov', income: 8500, expense: 4250.75 },
      ]);
    });

    it('should sort category breakdown by amount', async () => {
      const { result } = renderHook(() => useReportViewModel());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const categories = result.current.categoryBreakdownData;
      expect(categories[0].category_name).toBe('Alimentação');
      expect(categories[0].amount).toBeGreaterThan(categories[1].amount);
    });

    it('should transform to balance evolution data', async () => {
      const { result } = renderHook(() => useReportViewModel());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.balanceEvolutionData.length).toBeGreaterThan(0);
      expect(result.current.balanceEvolutionData[0]).toHaveProperty('label');
      expect(result.current.balanceEvolutionData[0]).toHaveProperty('value');
    });
  });

  describe('Filter Management', () => {
    it('should update filters', async () => {
      const { result } = renderHook(() => useReportViewModel());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setFilters({ periodType: 'yearly' });
      });

      expect(result.current.filters.periodType).toBe('yearly');
    });

    it('should update multiple filters at once', async () => {
      const { result } = renderHook(() => useReportViewModel());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setFilters({
          periodType: 'quarterly',
          transactionType: 'expense',
        });
      });

      expect(result.current.filters.periodType).toBe('quarterly');
      expect(result.current.filters.transactionType).toBe('expense');
    });

    it('should reset filters to default', async () => {
      const { result } = renderHook(() => useReportViewModel());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setFilters({ periodType: 'yearly' });
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters.periodType).toBe('monthly');
      expect(result.current.filters.transactionType).toBe('all');
    });
  });

  describe('Refresh', () => {
    it('should refresh data', async () => {
      const { result } = renderHook(() => useReportViewModel());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      jest.clearAllMocks();

      await act(async () => {
        await result.current.refreshReports();
      });

      expect(analyticsService.getFinancialSummary).toHaveBeenCalled();
      expect(result.current.isRefreshing).toBe(false);
    });

    it('should set isRefreshing during refresh', async () => {
      const { result } = renderHook(() => useReportViewModel());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let isRefreshingDuringCall = false;
      (analyticsService.getFinancialSummary as jest.Mock).mockImplementation(async () => {
        isRefreshingDuringCall = result.current.isRefreshing;
        return mockFinancialSummary;
      });

      await act(async () => {
        result.current.refreshReports();
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      await waitFor(() => {
        expect(result.current.isRefreshing).toBe(false);
      });
    });
  });

  describe('Empty State', () => {
    it('should return empty arrays when no data', async () => {
      (analyticsService.getFinancialSummary as jest.Mock).mockResolvedValue({
        ...mockFinancialSummary,
        monthly_breakdown: [],
        category_breakdown: [],
      });

      const { result } = renderHook(() => useReportViewModel());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.monthlyChartData).toEqual([]);
      expect(result.current.categoryBreakdownData).toEqual([]);
    });
  });
});
