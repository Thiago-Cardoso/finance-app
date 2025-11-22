/**
 * Dashboard ViewModel
 *
 * ViewModel to manage Dashboard state and logic.
 */

import { useState, useEffect, useCallback } from 'react';
import { getDashboardData } from '@/shared/services/api/dashboard.service';
import type { DashboardApiResponse } from '@/shared/models/Dashboard.model';

interface UseDashboardViewModel {
  data: DashboardApiResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  loadDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  period: string;
  setPeriod: (period: string) => void;
}

/**
 * Dashboard ViewModel hook
 */
export function useDashboardViewModel(): UseDashboardViewModel {
  const [data, setData] = useState<DashboardApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('this_month');

  /**
   * Load dashboard data
   */
  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const dashboardData = await getDashboardData(period);
      setData(dashboardData);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 'Error loading dashboard';
      setError(errorMessage);
      console.error('Error loading dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  /**
   * Refresh dashboard (pull-to-refresh)
   */
  const refreshDashboard = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const dashboardData = await getDashboardData(period);
      setData(dashboardData);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 'Error refreshing dashboard';
      setError(errorMessage);
      console.error('Error refreshing dashboard:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [period]);

  /**
   * Load dashboard on mount or when period changes
   */
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    loadDashboard,
    refreshDashboard,
    period,
    setPeriod,
  };
}
