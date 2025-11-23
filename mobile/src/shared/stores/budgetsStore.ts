/**
 * Budgets Store
 *
 * Zustand store para gerenciamento de estado de orçamentos.
 */

import { create } from 'zustand';
import type { Budget, BudgetAlert, BudgetFilters } from '@/shared/models/Budget.model';

interface BudgetsState {
  // Data
  budgets: Budget[];
  currentBudgets: Budget[];
  alerts: BudgetAlert[];
  selectedBudget: Budget | null;

  // Filters
  filters: BudgetFilters;

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Cache
  lastFetchedAt: number | null;
  cacheTimeout: number; // ms

  // Actions
  setBudgets: (budgets: Budget[]) => void;
  setCurrentBudgets: (budgets: Budget[]) => void;
  setAlerts: (alerts: BudgetAlert[]) => void;
  setSelectedBudget: (budget: Budget | null) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (id: number, budget: Partial<Budget>) => void;
  removeBudget: (id: number) => void;
  setFilters: (filters: Partial<BudgetFilters>) => void;
  clearFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  setRefreshing: (isRefreshing: boolean) => void;
  setError: (error: string | null) => void;
  markAlertAsRead: (alertId: number) => void;
  clearAlerts: () => void;
  isCacheValid: () => boolean;
  invalidateCache: () => void;
  getBudgetById: (id: number) => Budget | undefined;
  reset: () => void;
}

const initialFilters: BudgetFilters = {
  include_expired: false,
};

const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutos

export const useBudgetsStore = create<BudgetsState>((set, get) => ({
  // Initial state
  budgets: [],
  currentBudgets: [],
  alerts: [],
  selectedBudget: null,
  filters: initialFilters,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetchedAt: null,
  cacheTimeout: CACHE_TIMEOUT,

  // Actions
  setBudgets: (budgets) => {
    set({
      budgets,
      lastFetchedAt: Date.now(),
      error: null,
    });
  },

  setCurrentBudgets: (currentBudgets) => {
    set({ currentBudgets });
  },

  setAlerts: (alerts) => {
    set({ alerts });
  },

  setSelectedBudget: (selectedBudget) => {
    set({ selectedBudget });
  },

  addBudget: (budget) => {
    set((state) => ({
      budgets: [budget, ...state.budgets],
      currentBudgets: budget.period_type === 'monthly'
        ? [budget, ...state.currentBudgets]
        : state.currentBudgets,
    }));
  },

  updateBudget: (id, updatedData) => {
    set((state) => ({
      budgets: state.budgets.map((b) =>
        b.id === id ? { ...b, ...updatedData } : b
      ),
      currentBudgets: state.currentBudgets.map((b) =>
        b.id === id ? { ...b, ...updatedData } : b
      ),
      selectedBudget:
        state.selectedBudget?.id === id
          ? { ...state.selectedBudget, ...updatedData }
          : state.selectedBudget,
    }));
  },

  removeBudget: (id) => {
    set((state) => ({
      budgets: state.budgets.filter((b) => b.id !== id),
      currentBudgets: state.currentBudgets.filter((b) => b.id !== id),
      selectedBudget:
        state.selectedBudget?.id === id ? null : state.selectedBudget,
    }));
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearFilters: () => {
    set({ filters: initialFilters });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setRefreshing: (isRefreshing) => {
    set({ isRefreshing });
  },

  setError: (error) => {
    set({ error });
  },

  markAlertAsRead: (alertId) => {
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ),
    }));
  },

  clearAlerts: () => {
    set({ alerts: [] });
  },

  isCacheValid: () => {
    const { lastFetchedAt, cacheTimeout } = get();
    if (!lastFetchedAt) return false;
    return Date.now() - lastFetchedAt < cacheTimeout;
  },

  invalidateCache: () => {
    set({ lastFetchedAt: null });
  },

  getBudgetById: (id) => {
    const state = get();
    return state.budgets.find((b) => b.id === id) ||
           state.currentBudgets.find((b) => b.id === id);
  },

  reset: () => {
    set({
      budgets: [],
      currentBudgets: [],
      alerts: [],
      selectedBudget: null,
      filters: initialFilters,
      isLoading: false,
      isRefreshing: false,
      error: null,
      lastFetchedAt: null,
    });
  },
}));

/**
 * Seletores para o store
 */
export const budgetSelectors = {
  // Orçamentos ativos (não expirados)
  getActiveBudgets: (state: BudgetsState) =>
    state.budgets.filter((b) => new Date(b.period_end) >= new Date()),

  // Orçamentos excedidos
  getOverBudgets: (state: BudgetsState) =>
    state.budgets.filter((b) => b.status === 'over_budget'),

  // Orçamentos em alerta
  getWarningBudgets: (state: BudgetsState) =>
    state.budgets.filter((b) => b.status === 'warning' || b.status === 'critical'),

  // Orçamentos por categoria
  getBudgetsByCategory: (state: BudgetsState, categoryId: number) =>
    state.budgets.filter((b) => b.category_id === categoryId),

  // Alertas não lidos
  getUnreadAlerts: (state: BudgetsState) =>
    state.alerts.filter((a) => !a.is_read),

  // Total gasto em orçamentos
  getTotalSpent: (state: BudgetsState) =>
    state.currentBudgets.reduce((sum, b) => sum + b.spent_amount, 0),

  // Total limite em orçamentos
  getTotalLimit: (state: BudgetsState) =>
    state.currentBudgets.reduce((sum, b) => sum + b.limit_amount, 0),

  // Percentual geral de uso
  getOverallUsage: (state: BudgetsState) => {
    const totalLimit = state.currentBudgets.reduce((sum, b) => sum + b.limit_amount, 0);
    const totalSpent = state.currentBudgets.reduce((sum, b) => sum + b.spent_amount, 0);
    return totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  },
};
