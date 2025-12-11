/**
 * Report ViewModel
 *
 * ViewModel to manage Reports state and logic.
 * Handles data fetching, filtering, and data transformation for charts.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  getFinancialSummary,
  getBudgetPerformance,
  transformToBalanceEvolution,
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

  // Ref to access current cache in async callbacks without dependency loop
  const cacheRef = useRef(cache);
  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  /**
   * Build API filters from UI filters
   * No dependencies needed - accepts filters as parameter
   */
  const buildApiFilters = useCallback((currentFilters: ReportFilterOptions): AnalyticsFilters => {
    const apiFilters: AnalyticsFilters = {
      period_type: currentFilters.periodType,
    };

    if (currentFilters.periodType === 'custom_range' && currentFilters.startDate && currentFilters.endDate) {
      apiFilters.start_date = currentFilters.startDate.toISOString().split('T')[0];
      apiFilters.end_date = currentFilters.endDate.toISOString().split('T')[0];
    }

    if (currentFilters.categoryIds && currentFilters.categoryIds.length > 0) {
      apiFilters.category_ids = currentFilters.categoryIds;
    }

    if (currentFilters.transactionType && currentFilters.transactionType !== 'all') {
      apiFilters.transaction_type = currentFilters.transactionType;
    }

    return apiFilters;
  }, []);

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

      const apiFilters = buildApiFilters(filters);
      const currentCache = cacheRef.current;
      const promises: Promise<void>[] = [];

      // Check financial summary cache
      if (isCacheValid(currentCache.financialSummary)) {
        setFinancialSummary(currentCache.financialSummary!.data);
      } else {
        // Load fresh data
        promises.push(
          getFinancialSummary(apiFilters).then((summaryData) => {
            setFinancialSummary(summaryData);
            setCache((prev) => ({
              ...prev,
              financialSummary: { data: summaryData, timestamp: Date.now() },
            }));
          })
        );
      }

      // Check budget performance cache
      if (isCacheValid(currentCache.budgetPerformance)) {
        setBudgetPerformance(currentCache.budgetPerformance!.data);
      } else {
        // Load fresh data
        promises.push(
          getBudgetPerformance(apiFilters)
            .then((performanceData) => {
              setBudgetPerformance(performanceData);
              setCache((prev) => ({
                ...prev,
                budgetPerformance: { data: performanceData, timestamp: Date.now() },
              }));
            })
            .catch(() => {
              console.warn('Budget performance not available');
            })
        );
      }

      await Promise.all(promises);
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao carregar relatórios';
      setError(errorMessage);
      console.error('Error loading reports:', err);
    } finally {
      setIsLoading(false);
    }
  }, [buildApiFilters, filters, isCacheValid]);

  /**
   * Refresh reports (pull-to-refresh)
   */
  const refreshReports = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      // Clear cache
      setCache({ financialSummary: null, budgetPerformance: null });

      const apiFilters = buildApiFilters(filters);

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
  }, [buildApiFilters, filters]);

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
   * Load reports on mount
   */
  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  /**
   * Reload reports when filters change
   */
  useEffect(() => {
    // Skip first render (already loaded on mount)
    if (financialSummary) {
      loadReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // Reload when filters change

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
