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
 * Mock data for testing charts
 * TODO: Remove this after testing
 */
const MOCK_DASHBOARD_DATA: DashboardApiResponse = {
  summary: {
    period: {
      start_date: '2024-11-01',
      end_date: '2024-11-30',
      period_type: 'monthly',
    },
    summary: {
      total_income: 8500.00,
      total_expenses: 4250.75,
      net_balance: 4249.25,
      transaction_count: 25,
    },
    monthly_breakdown: [],
    category_breakdown: [],
    generated_at: new Date().toISOString(),
  },
  categories_breakdown: [
    {
      category_id: 1,
      category_name: 'Alimentação',
      category_color: '#FF6B6B',
      amount: 1250.50,
      percentage: 29.4,
      transaction_count: 12,
    },
    {
      category_id: 2,
      category_name: 'Transporte',
      category_color: '#4ECDC4',
      amount: 850.00,
      percentage: 20.0,
      transaction_count: 8,
    },
    {
      category_id: 3,
      category_name: 'Lazer',
      category_color: '#FFD93D',
      amount: 650.25,
      percentage: 15.3,
      transaction_count: 5,
    },
    {
      category_id: 4,
      category_name: 'Moradia',
      category_color: '#5843BE',
      amount: 1500.00,
      percentage: 35.3,
      transaction_count: 3,
    },
  ],
  budget_progress: [
    {
      budget_id: 1,
      budget_name: 'Alimentação',
      category_name: 'Alimentação',
      category_color: '#FF6B6B',
      period_type: 'monthly',
      amount: 1500.00,
      spent: 1250.50,
      remaining: 249.50,
      usage_percentage: 83.4,
      status: 'warning',
    },
    {
      budget_id: 2,
      budget_name: 'Transporte',
      category_name: 'Transporte',
      category_color: '#4ECDC4',
      period_type: 'monthly',
      amount: 1000.00,
      spent: 850.00,
      remaining: 150.00,
      usage_percentage: 85.0,
      status: 'warning',
    },
    {
      budget_id: 3,
      budget_name: 'Lazer',
      category_name: 'Lazer',
      category_color: '#FFD93D',
      period_type: 'monthly',
      amount: 800.00,
      spent: 650.25,
      remaining: 149.75,
      usage_percentage: 81.3,
      status: 'on_track',
    },
  ],
  recent_transactions: [
    {
      id: 1,
      description: 'Supermercado Extra',
      amount: 245.50,
      transaction_type: 'expense',
      category_name: 'Alimentação',
      date: '2024-11-23',
      account_name: 'Nubank',
    },
    {
      id: 2,
      description: 'Uber',
      amount: 35.00,
      transaction_type: 'expense',
      category_name: 'Transporte',
      date: '2024-11-22',
      account_name: 'Nubank',
    },
    {
      id: 3,
      description: 'Salário',
      amount: 8500.00,
      transaction_type: 'income',
      category_name: 'Salário',
      date: '2024-11-05',
      account_name: 'Itaú',
    },
  ],
  period: 'this_month',
};

// Set to true to use mock data for testing
const USE_MOCK_DATA = false;

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

      // Use mock data for testing
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        setData(MOCK_DASHBOARD_DATA);
        return;
      }

      // Read period from state ref to avoid dependency
      setPeriod((currentPeriod) => {
        getDashboardData(currentPeriod)
          .then((dashboardData) => setData(dashboardData))
          .catch((err: any) => {
            const errorMessage = err?.response?.data?.error || 'Error loading dashboard';
            setError(errorMessage);
            console.error('Error loading dashboard:', err);
          })
          .finally(() => setIsLoading(false));
        return currentPeriod;
      });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 'Error loading dashboard';
      setError(errorMessage);
      console.error('Error loading dashboard:', err);
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh dashboard (pull-to-refresh)
   */
  const refreshDashboard = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      // Use mock data for testing
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        setData(MOCK_DASHBOARD_DATA);
        return;
      }

      // Read period from state ref to avoid dependency
      setPeriod((currentPeriod) => {
        getDashboardData(currentPeriod)
          .then((dashboardData) => setData(dashboardData))
          .catch((err: any) => {
            const errorMessage = err?.response?.data?.error || 'Error refreshing dashboard';
            setError(errorMessage);
            console.error('Error refreshing dashboard:', err);
          })
          .finally(() => setIsRefreshing(false));
        return currentPeriod;
      });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 'Error refreshing dashboard';
      setError(errorMessage);
      console.error('Error refreshing dashboard:', err);
      setIsRefreshing(false);
    }
  }, []);

  /**
   * Load dashboard on mount only
   * DO NOT add loadDashboard to deps - it would cause infinite loop
   */
  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

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
