/**
 * Report ViewModel
 *
 * ViewModel to manage Reports state and logic.
 * Handles data fetching, filtering, and data transformation for charts.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getFinancialSummary,
  getBudgetPerformance,
  transformToBalanceEvolution,
  getDateRangeForPeriod,
} from '@/shared/services/api/analytics.service';
import type {
  AnalyticsFilters,
  FinancialSummary,
  BudgetPerformance,
  CategoryBreakdown,
  MonthlyBreakdown,
  BalanceDataPoint,
  ReportFilterOptions,
} from '@/shared/types/analytics';
import type { BarChartDataItem } from '@/shared/components/charts';
import type { LineChartDataPoint } from '@/shared/components/charts';

// Cache duration: 10 minutes
const CACHE_DURATION = 10 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface UseReportViewModel {
  // Data
  financialSummary: FinancialSummary | null;
  budgetPerformance: BudgetPerformance | null;

  // Transformed data for charts
  monthlyChartData: BarChartDataItem[];
  categoryBreakdownData: CategoryBreakdown[];
  balanceEvolutionData: LineChartDataPoint[];

  // State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Filters
  filters: ReportFilterOptions;
  setFilters: (filters: Partial<ReportFilterOptions>) => void;
  resetFilters: () => void;

  // Actions
  loadReports: () => Promise<void>;
  refreshReports: () => Promise<void>;
}

const DEFAULT_FILTERS: ReportFilterOptions = {
  periodType: 'monthly',
  transactionType: 'all',
};

/**
 * Report ViewModel hook
 */
export function useReportViewModel(): UseReportViewModel {
  // State
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [budgetPerformance, setBudgetPerformance] = useState<BudgetPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ReportFilterOptions>(DEFAULT_FILTERS);

  // Cache
  const [cache, setCache] = useState<{
    financialSummary: CacheEntry<FinancialSummary> | null;
    budgetPerformance: CacheEntry<BudgetPerformance> | null;
  }>({
    financialSummary: null,
    budgetPerformance: null,
  });

  /**
   * Build API filters from UI filters
   */
  const buildApiFilters = useCallback((): AnalyticsFilters => {
    const apiFilters: AnalyticsFilters = {
      period_type: filters.periodType,
    };

    if (filters.periodType === 'custom_range' && filters.startDate && filters.endDate) {
      apiFilters.start_date = filters.startDate.toISOString().split('T')[0];
      apiFilters.end_date = filters.endDate.toISOString().split('T')[0];
    }

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      apiFilters.category_ids = filters.categoryIds;
    }

    if (filters.transactionType && filters.transactionType !== 'all') {
      apiFilters.transaction_type = filters.transactionType;
    }

    return apiFilters;
  }, [filters]);

  /**
   * Check if cache is valid
   */
  const isCacheValid = useCallback((entry: CacheEntry<any> | null): boolean => {
    if (!entry) return false;
    return Date.now() - entry.timestamp < CACHE_DURATION;
  }, []);

  /**
   * Load reports data
   */
  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const apiFilters = buildApiFilters();

      // Check cache
      if (isCacheValid(cache.financialSummary)) {
        setFinancialSummary(cache.financialSummary!.data);
      } else {
        const summaryData = await getFinancialSummary(apiFilters);
        setFinancialSummary(summaryData);
        setCache((prev) => ({
          ...prev,
          financialSummary: { data: summaryData, timestamp: Date.now() },
        }));
      }

      // Budget performance (separate call)
      if (isCacheValid(cache.budgetPerformance)) {
        setBudgetPerformance(cache.budgetPerformance!.data);
      } else {
        try {
          const performanceData = await getBudgetPerformance(apiFilters);
          setBudgetPerformance(performanceData);
          setCache((prev) => ({
            ...prev,
            budgetPerformance: { data: performanceData, timestamp: Date.now() },
          }));
        } catch {
          // Budget performance is optional, don't fail the whole load
          console.warn('Budget performance not available');
        }
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao carregar relatórios';
      setError(errorMessage);
      console.error('Error loading reports:', err);
    } finally {
      setIsLoading(false);
    }
  }, [buildApiFilters, cache, isCacheValid]);

  /**
   * Refresh reports (pull-to-refresh)
   */
  const refreshReports = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      // Clear cache
      setCache({ financialSummary: null, budgetPerformance: null });

      const apiFilters = buildApiFilters();

      const summaryData = await getFinancialSummary(apiFilters);
      setFinancialSummary(summaryData);
      setCache((prev) => ({
        ...prev,
        financialSummary: { data: summaryData, timestamp: Date.now() },
      }));

      try {
        const performanceData = await getBudgetPerformance(apiFilters);
        setBudgetPerformance(performanceData);
        setCache((prev) => ({
          ...prev,
          budgetPerformance: { data: performanceData, timestamp: Date.now() },
        }));
      } catch {
        console.warn('Budget performance not available');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao atualizar relatórios';
      setError(errorMessage);
      console.error('Error refreshing reports:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [buildApiFilters]);

  /**
   * Update filters
   */
  const setFilters = useCallback((newFilters: Partial<ReportFilterOptions>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    // Clear cache when filters change
    setCache({ financialSummary: null, budgetPerformance: null });
  }, []);

  /**
   * Reset filters to defaults
   */
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setCache({ financialSummary: null, budgetPerformance: null });
  }, []);

  /**
   * Transform monthly breakdown to BarChart data
   */
  const monthlyChartData = useMemo((): BarChartDataItem[] => {
    if (!financialSummary?.monthly_breakdown) return [];

    return financialSummary.monthly_breakdown.map((item) => ({
      label: item.month_name,
      income: item.income,
      expense: item.expense,
    }));
  }, [financialSummary]);

  /**
   * Get category breakdown data (sorted by amount)
   */
  const categoryBreakdownData = useMemo((): CategoryBreakdown[] => {
    if (!financialSummary?.category_breakdown) return [];

    return [...financialSummary.category_breakdown]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10); // Limit to top 10 categories
  }, [financialSummary]);

  /**
   * Transform to balance evolution data
   */
  const balanceEvolutionData = useMemo((): LineChartDataPoint[] => {
    if (!financialSummary?.monthly_breakdown) return [];

    const balanceData = transformToBalanceEvolution(financialSummary.monthly_breakdown, 0);

    return balanceData.map((item) => ({
      label: item.label,
      value: item.balance,
      date: item.date,
    }));
  }, [financialSummary]);

  /**
   * Load reports on mount and when filters change
   */
  useEffect(() => {
    loadReports();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // Data
    financialSummary,
    budgetPerformance,

    // Transformed data
    monthlyChartData,
    categoryBreakdownData,
    balanceEvolutionData,

    // State
    isLoading,
    isRefreshing,
    error,

    // Filters
    filters,
    setFilters,
    resetFilters,

    // Actions
    loadReports,
    refreshReports,
  };
}

export default useReportViewModel;
