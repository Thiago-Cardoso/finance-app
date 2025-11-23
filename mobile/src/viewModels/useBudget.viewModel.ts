/**
 * Budget ViewModel
 *
 * ViewModel para gerenciamento de orçamentos.
 */

import { useCallback, useRef } from 'react';
import { useBudgetsStore, budgetSelectors } from '@/shared/stores/budgetsStore';
import * as budgetsService from '@/shared/services/api/budgets.service';
import type { Budget, BudgetFormData, BudgetFilters } from '@/shared/models/Budget.model';

interface UseBudgetViewModel {
  // Data
  budgets: Budget[];
  currentBudgets: Budget[];
  selectedBudget: Budget | null;
  alerts: ReturnType<typeof budgetSelectors.getUnreadAlerts>;

  // Computed
  overBudgets: Budget[];
  warningBudgets: Budget[];
  totalSpent: number;
  totalLimit: number;
  overallUsage: number;

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  loadBudgets: (filters?: BudgetFilters, forceRefresh?: boolean) => Promise<void>;
  loadCurrentBudgets: () => Promise<void>;
  loadBudgetById: (id: number) => Promise<Budget | null>;
  createBudget: (data: BudgetFormData) => Promise<{ success: boolean; budget?: Budget; error?: string }>;
  updateBudget: (id: number, data: Partial<BudgetFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteBudget: (id: number) => Promise<{ success: boolean; error?: string }>;
  refreshBudgets: () => Promise<void>;
  loadAlerts: () => Promise<void>;
  dismissAlert: (alertId: number) => Promise<void>;
  setSelectedBudget: (budget: Budget | null) => void;
  clearErrors: () => void;
}

export function useBudgetViewModel(): UseBudgetViewModel {
  // Get store state directly
  const budgets = useBudgetsStore((state) => state.budgets);
  const currentBudgets = useBudgetsStore((state) => state.currentBudgets);
  // Removed unused alerts variable
  const selectedBudget = useBudgetsStore((state) => state.selectedBudget);
  const filters = useBudgetsStore((state) => state.filters);
  const isLoading = useBudgetsStore((state) => state.isLoading);
  const isRefreshing = useBudgetsStore((state) => state.isRefreshing);
  const error = useBudgetsStore((state) => state.error);

  // Get store actions directly (these are stable)
  const setBudgets = useBudgetsStore((state) => state.setBudgets);
  const setCurrentBudgets = useBudgetsStore((state) => state.setCurrentBudgets);
  const setAlerts = useBudgetsStore((state) => state.setAlerts);
  const setSelectedBudget = useBudgetsStore((state) => state.setSelectedBudget);
  const addBudget = useBudgetsStore((state) => state.addBudget);
  const updateBudgetInStore = useBudgetsStore((state) => state.updateBudget);
  const removeBudget = useBudgetsStore((state) => state.removeBudget);
  const setLoading = useBudgetsStore((state) => state.setLoading);
  const setRefreshing = useBudgetsStore((state) => state.setRefreshing);
  const setError = useBudgetsStore((state) => state.setError);
  const markAlertAsRead = useBudgetsStore((state) => state.markAlertAsRead);
  const isCacheValid = useBudgetsStore((state) => state.isCacheValid);
  const invalidateCache = useBudgetsStore((state) => state.invalidateCache);

  // Refs to track loading state (prevent double calls)
  const isLoadingRef = useRef(false);

  // Computed values using selectors
  const overBudgets = useBudgetsStore((state) => budgetSelectors.getOverBudgets(state));
  const warningBudgets = useBudgetsStore((state) => budgetSelectors.getWarningBudgets(state));
  const totalSpent = useBudgetsStore((state) => budgetSelectors.getTotalSpent(state));
  const totalLimit = useBudgetsStore((state) => budgetSelectors.getTotalLimit(state));
  const overallUsage = useBudgetsStore((state) => budgetSelectors.getOverallUsage(state));
  const unreadAlerts = useBudgetsStore((state) => budgetSelectors.getUnreadAlerts(state));

  /**
   * Carrega orçamentos
   */
  const loadBudgets = useCallback(
    async (newFilters?: BudgetFilters, forceRefresh = false) => {
      // Prevent concurrent calls
      if (isLoadingRef.current) return;

      // Verificar cache
      if (!forceRefresh && isCacheValid() && budgets.length > 0) {
        return;
      }

      try {
        isLoadingRef.current = true;
        setLoading(true);
        setError(null);

        const result = await budgetsService.getBudgets(newFilters || filters);
        setBudgets(result);
      } catch (err: any) {
        // Se for 404, significa que a API ainda não existe - mostrar lista vazia
        if (err?.response?.status === 404) {
          setBudgets([]);
          console.log('Budgets API not available yet');
        } else {
          const errorMessage = err?.response?.data?.error || 'Erro ao carregar orçamentos';
          setError(errorMessage);
          console.error('Error loading budgets:', err);
        }
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    },
    [budgets.length, filters, isCacheValid, setBudgets, setError, setLoading]
  );

  /**
   * Carrega orçamentos do mês atual
   */
  const loadCurrentBudgets = useCallback(async () => {
    // Prevent concurrent calls
    if (isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      const result = await budgetsService.getCurrentBudgets();
      setCurrentBudgets(result);
    } catch (err: any) {
      // Se for 404, significa que a API ainda não existe - mostrar lista vazia
      if (err?.response?.status === 404) {
        setCurrentBudgets([]);
        console.log('Budgets API not available yet');
      } else {
        const errorMessage = err?.response?.data?.error || 'Erro ao carregar orçamentos atuais';
        setError(errorMessage);
        console.error('Error loading current budgets:', err);
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [setCurrentBudgets, setError, setLoading]);

  /**
   * Carrega orçamento por ID
   */
  const loadBudgetById = useCallback(
    async (id: number): Promise<Budget | null> => {
      try {
        setLoading(true);
        setError(null);

        const budget = await budgetsService.getBudgetById(id);
        setSelectedBudget(budget);
        return budget;
      } catch (err: any) {
        const errorMessage = err?.response?.data?.error || 'Erro ao carregar orçamento';
        setError(errorMessage);
        console.error('Error loading budget:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setSelectedBudget]
  );

  /**
   * Cria novo orçamento
   */
  const createBudget = useCallback(
    async (data: BudgetFormData): Promise<{ success: boolean; budget?: Budget; error?: string }> => {
      try {
        setLoading(true);
        setError(null);

        const budget = await budgetsService.createBudget(data);
        addBudget(budget);
        invalidateCache();

        return { success: true, budget };
      } catch (err: any) {
        const errorMessage = err?.response?.data?.error || 'Erro ao criar orçamento';
        setError(errorMessage);
        console.error('Error creating budget:', err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [addBudget, invalidateCache, setError, setLoading]
  );

  /**
   * Atualiza orçamento
   */
  const updateBudget = useCallback(
    async (id: number, data: Partial<BudgetFormData>): Promise<{ success: boolean; error?: string }> => {
      try {
        setLoading(true);
        setError(null);

        const budget = await budgetsService.updateBudget(id, data);
        updateBudgetInStore(id, budget);
        invalidateCache();

        return { success: true };
      } catch (err: any) {
        const errorMessage = err?.response?.data?.error || 'Erro ao atualizar orçamento';
        setError(errorMessage);
        console.error('Error updating budget:', err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [invalidateCache, setError, setLoading, updateBudgetInStore]
  );

  /**
   * Exclui orçamento
   */
  const deleteBudget = useCallback(
    async (id: number): Promise<{ success: boolean; error?: string }> => {
      try {
        setLoading(true);
        setError(null);

        await budgetsService.deleteBudget(id);
        removeBudget(id);
        invalidateCache();

        return { success: true };
      } catch (err: any) {
        const errorMessage = err?.response?.data?.error || 'Erro ao excluir orçamento';
        setError(errorMessage);
        console.error('Error deleting budget:', err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [invalidateCache, removeBudget, setError, setLoading]
  );

  /**
   * Atualiza orçamentos (pull-to-refresh)
   */
  const refreshBudgets = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      const [budgetsResult, currentResult] = await Promise.allSettled([
        budgetsService.getBudgets(filters),
        budgetsService.getCurrentBudgets(),
      ]);

      // Processar resultados mesmo se um falhar
      if (budgetsResult.status === 'fulfilled') {
        setBudgets(budgetsResult.value);
      } else if (budgetsResult.reason?.response?.status === 404) {
        setBudgets([]);
      }

      if (currentResult.status === 'fulfilled') {
        setCurrentBudgets(currentResult.value);
      } else if (currentResult.reason?.response?.status === 404) {
        setCurrentBudgets([]);
      }
    } catch (err: any) {
      // Se for 404, significa que a API ainda não existe
      if (err?.response?.status === 404) {
        setBudgets([]);
        setCurrentBudgets([]);
      } else {
        const errorMessage = err?.response?.data?.error || 'Erro ao atualizar orçamentos';
        setError(errorMessage);
        console.error('Error refreshing budgets:', err);
      }
    } finally {
      setRefreshing(false);
    }
  }, [filters, setBudgets, setCurrentBudgets, setError, setRefreshing]);

  /**
   * Carrega alertas
   */
  const loadAlerts = useCallback(async () => {
    try {
      const result = await budgetsService.getBudgetAlerts();
      setAlerts(result);
    } catch (err: any) {
      // Silenciar erro 404 - API ainda não implementada
      if (err?.response?.status !== 404) {
        console.error('Error loading budget alerts:', err);
      }
    }
  }, [setAlerts]);

  /**
   * Dispensa alerta
   */
  const dismissAlert = useCallback(
    async (alertId: number) => {
      try {
        await budgetsService.markAlertAsRead(alertId);
        markAlertAsRead(alertId);
      } catch (err: any) {
        console.error('Error dismissing alert:', err);
      }
    },
    [markAlertAsRead]
  );

  /**
   * Limpa erros
   */
  const clearErrors = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // Data
    budgets,
    currentBudgets,
    selectedBudget,
    alerts: unreadAlerts,

    // Computed
    overBudgets,
    warningBudgets,
    totalSpent,
    totalLimit,
    overallUsage,

    // UI State
    isLoading,
    isRefreshing,
    error,

    // Actions
    loadBudgets,
    loadCurrentBudgets,
    loadBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
    refreshBudgets,
    loadAlerts,
    dismissAlert,
    setSelectedBudget,
    clearErrors,
  };
}
