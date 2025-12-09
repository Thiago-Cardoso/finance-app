/**
 * Goal ViewModel
 *
 * ViewModel para gerenciamento de metas financeiras.
 */

import { useCallback, useRef, useMemo } from 'react';
import { useGoalsStore } from '@/shared/stores/goalsStore';
import * as goalsService from '@/shared/services/api/goals.service';
import type {
  Goal,
  CreateGoalData,
  UpdateGoalData,
  CreateContributionData,
  GoalFilters,
} from '@/shared/models/Goal.model';

interface UseGoalViewModel {
  // Data
  goals: Goal[];
  meta: any;
  selectedGoal: Goal | null;

  // Computed
  activeGoals: Goal[];
  completedGoals: Goal[];
  overdueGoals: Goal[];
  offTrackGoals: Goal[];
  totalTargetAmount: number;
  totalCurrentAmount: number;
  overallProgress: number;

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  loadGoals: (filters?: GoalFilters, forceRefresh?: boolean) => Promise<void>;
  loadGoalById: (id: number) => Promise<Goal | null>;
  createGoal: (data: CreateGoalData) => Promise<{ success: boolean; goal?: Goal; error?: string }>;
  updateGoal: (
    id: number,
    data: Partial<UpdateGoalData>
  ) => Promise<{ success: boolean; goal?: Goal; error?: string }>;
  deleteGoal: (id: number) => Promise<{ success: boolean; error?: string }>;
  addContribution: (
    goalId: number,
    data: CreateContributionData
  ) => Promise<{ success: boolean; error?: string }>;
  refreshGoals: () => Promise<void>;
  setSelectedGoal: (goal: Goal | null) => void;
  clearErrors: () => void;
}

export function useGoalViewModel(): UseGoalViewModel {
  // Get store state directly
  const goals = useGoalsStore((state) => state.goals);
  const meta = useGoalsStore((state) => state.meta);
  const selectedGoal = useGoalsStore((state) => state.selectedGoal);
  const isLoading = useGoalsStore((state) => state.isLoading);
  const isRefreshing = useGoalsStore((state) => state.isRefreshing);
  const error = useGoalsStore((state) => state.error);

  // Get store actions directly (these are stable)
  const setGoals = useGoalsStore((state) => state.setGoals);
  const setMeta = useGoalsStore((state) => state.setMeta);
  const setSelectedGoal = useGoalsStore((state) => state.setSelectedGoal);
  const addGoal = useGoalsStore((state) => state.addGoal);
  const updateGoalInStore = useGoalsStore((state) => state.updateGoal);
  const removeGoal = useGoalsStore((state) => state.removeGoal);
  const setLoading = useGoalsStore((state) => state.setLoading);
  const setRefreshing = useGoalsStore((state) => state.setRefreshing);
  const setError = useGoalsStore((state) => state.setError);
  const clearCache = useGoalsStore((state) => state.clearCache);

  // Refs to track loading state (prevent double calls)
  const isLoadingRef = useRef(false);

  // Computed values using useMemo to prevent infinite loops
  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === 'active'),
    [goals]
  );

  const completedGoals = useMemo(
    () => goals.filter((g) => g.status === 'completed'),
    [goals]
  );

  const overdueGoals = useMemo(
    () => goals.filter((g) => g['is_overdue?'] === true),
    [goals]
  );

  const offTrackGoals = useMemo(
    () => goals.filter((g) => g['is_on_track?'] === false && g.status === 'active'),
    [goals]
  );

  const totalTargetAmount = useMemo(() => {
    return activeGoals.reduce((sum, g) => {
      const target =
        typeof g.target_amount === 'string' ? parseFloat(g.target_amount) : g.target_amount;
      return sum + target;
    }, 0);
  }, [activeGoals]);

  const totalCurrentAmount = useMemo(() => {
    return activeGoals.reduce((sum, g) => {
      const current =
        typeof g.current_amount === 'string' ? parseFloat(g.current_amount) : g.current_amount;
      return sum + current;
    }, 0);
  }, [activeGoals]);

  const overallProgress = useMemo(() => {
    if (activeGoals.length === 0) return 0;
    return totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
  }, [activeGoals.length, totalTargetAmount, totalCurrentAmount]);

  /**
   * Carrega metas
   */
  const loadGoals = useCallback(
    async (filters?: GoalFilters, forceRefresh = false) => {
      // Prevent concurrent calls
      if (isLoadingRef.current) return;

      // Get current state
      const currentGoals = useGoalsStore.getState().goals;
      const currentIsCacheValid = useGoalsStore.getState().isCacheValid();

      // Verificar cache
      if (!forceRefresh && currentIsCacheValid && currentGoals.length > 0) {
        return;
      }

      try {
        isLoadingRef.current = true;
        setLoading(true);
        setError(null);

        const response = await goalsService.getGoals(filters);
        setGoals(response.data);
        setMeta(response.meta);
      } catch (err: any) {
        // Se for 404, significa que a API ainda não existe - mostrar lista vazia
        if (err?.response?.status === 404) {
          setGoals([]);
          setMeta({
            total_count: 0,
            active_count: 0,
            completed_count: 0,
            total_target_amount: 0,
            total_current_amount: 0,
          });
          console.log('Goals API not available yet');
        } else {
          const errorMessage = err?.response?.data?.message || 'Erro ao carregar metas';
          setError(errorMessage);
          console.error('Error loading goals:', err);
        }
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    },
    [setGoals, setMeta, setError, setLoading]
  );

  /**
   * Carrega meta por ID
   */
  const loadGoalById = useCallback(
    async (id: number): Promise<Goal | null> => {
      try {
        setLoading(true);
        setError(null);

        const goal = await goalsService.getGoal(id);
        setSelectedGoal(goal);
        return goal;
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Erro ao carregar meta';
        setError(errorMessage);
        console.error('Error loading goal:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setSelectedGoal]
  );

  /**
   * Cria nova meta
   */
  const createGoal = useCallback(
    async (data: CreateGoalData): Promise<{ success: boolean; goal?: Goal; error?: string }> => {
      try {
        setLoading(true);
        setError(null);

        const goal = await goalsService.createGoal(data);
        addGoal(goal);
        clearCache();

        return { success: true, goal };
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Erro ao criar meta';
        setError(errorMessage);
        console.error('Error creating goal:', err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [addGoal, clearCache, setError, setLoading]
  );

  /**
   * Atualiza meta
   */
  const updateGoal = useCallback(
    async (
      id: number,
      data: Partial<UpdateGoalData>
    ): Promise<{ success: boolean; goal?: Goal; error?: string }> => {
      try {
        setLoading(true);
        setError(null);

        const goal = await goalsService.updateGoal(id, data);
        updateGoalInStore(id, goal);
        clearCache();

        return { success: true, goal };
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Erro ao atualizar meta';
        setError(errorMessage);
        console.error('Error updating goal:', err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [clearCache, setError, setLoading, updateGoalInStore]
  );

  /**
   * Exclui meta
   */
  const deleteGoal = useCallback(
    async (id: number): Promise<{ success: boolean; error?: string }> => {
      try {
        setLoading(true);
        setError(null);

        await goalsService.deleteGoal(id);
        removeGoal(id);
        clearCache();

        return { success: true };
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Erro ao excluir meta';
        setError(errorMessage);
        console.error('Error deleting goal:', err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [clearCache, removeGoal, setError, setLoading]
  );

  /**
   * Adiciona contribuição a uma meta
   */
  const addContribution = useCallback(
    async (
      goalId: number,
      data: CreateContributionData
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        setLoading(true);
        setError(null);

        const { goal } = await goalsService.addContribution(goalId, data);
        updateGoalInStore(goalId, goal);
        clearCache();

        return { success: true };
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Erro ao adicionar contribuição';
        setError(errorMessage);
        console.error('Error adding contribution:', err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [clearCache, setError, setLoading, updateGoalInStore]
  );

  /**
   * Atualiza metas (pull-to-refresh)
   */
  const refreshGoals = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      const response = await goalsService.getGoals();
      setGoals(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      // Se for 404, significa que a API ainda não existe
      if (err?.response?.status === 404) {
        setGoals([]);
        setMeta({
          total_count: 0,
          active_count: 0,
          completed_count: 0,
          total_target_amount: 0,
          total_current_amount: 0,
        });
      } else {
        const errorMessage = err?.response?.data?.message || 'Erro ao atualizar metas';
        setError(errorMessage);
        console.error('Error refreshing goals:', err);
      }
    } finally {
      setRefreshing(false);
    }
  }, [setGoals, setMeta, setError, setRefreshing]);

  /**
   * Limpa erros
   */
  const clearErrors = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // Data
    goals,
    meta,
    selectedGoal,

    // Computed
    activeGoals,
    completedGoals,
    overdueGoals,
    offTrackGoals,
    totalTargetAmount,
    totalCurrentAmount,
    overallProgress,

    // UI State
    isLoading,
    isRefreshing,
    error,

    // Actions
    loadGoals,
    loadGoalById,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    refreshGoals,
    setSelectedGoal,
    clearErrors,
  };
}
