/**
 * Goals Store
 *
 * Zustand store para gerenciamento de estado de metas financeiras.
 */

import { create } from 'zustand';
import type { Goal, GoalsListResponse } from '@/shared/models/Goal.model';

interface GoalsState {
  // Data
  goals: Goal[];
  meta: GoalsListResponse['meta'] | null;
  selectedGoal: Goal | null;

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Cache
  lastFetchedAt: number | null;
  cacheTimeout: number; // ms

  // Actions
  setGoals: (goals: Goal[]) => void;
  setMeta: (meta: GoalsListResponse['meta']) => void;
  setSelectedGoal: (goal: Goal | null) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: number, goal: Goal) => void;
  removeGoal: (id: number) => void;
  setLoading: (isLoading: boolean) => void;
  setRefreshing: (isRefreshing: boolean) => void;
  setError: (error: string | null) => void;
  clearCache: () => void;
  isCacheValid: () => boolean;
  getGoalById: (id: number) => Goal | undefined;
  reset: () => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const useGoalsStore = create<GoalsState>((set, get) => ({
  // Initial state
  goals: [],
  meta: null,
  selectedGoal: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetchedAt: null,
  cacheTimeout: CACHE_TTL,

  // Actions
  setGoals: (goals) => {
    set({
      goals,
      lastFetchedAt: Date.now(),
      error: null,
    });
  },

  setMeta: (meta) => {
    set({ meta });
  },

  setSelectedGoal: (selectedGoal) => {
    set({ selectedGoal });
  },

  addGoal: (goal) => {
    set((state) => ({
      goals: [goal, ...state.goals],
      meta: state.meta
        ? {
            ...state.meta,
            total_count: state.meta.total_count + 1,
            active_count:
              goal.status === 'active' ? state.meta.active_count + 1 : state.meta.active_count,
          }
        : null,
    }));
  },

  updateGoal: (id, updatedGoal) => {
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? updatedGoal : g)),
      selectedGoal: state.selectedGoal?.id === id ? updatedGoal : state.selectedGoal,
    }));
  },

  removeGoal: (id) => {
    set((state) => {
      const goal = state.goals.find((g) => g.id === id);
      return {
        goals: state.goals.filter((g) => g.id !== id),
        selectedGoal: state.selectedGoal?.id === id ? null : state.selectedGoal,
        meta:
          state.meta && goal
            ? {
                ...state.meta,
                total_count: state.meta.total_count - 1,
                active_count:
                  goal.status === 'active' ? state.meta.active_count - 1 : state.meta.active_count,
              }
            : state.meta,
      };
    });
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

  clearCache: () => {
    set({ lastFetchedAt: null });
  },

  isCacheValid: () => {
    const { lastFetchedAt, cacheTimeout } = get();
    if (!lastFetchedAt) return false;
    return Date.now() - lastFetchedAt < cacheTimeout;
  },

  getGoalById: (id) => {
    const state = get();
    return state.goals.find((g) => g.id === id);
  },

  reset: () => {
    set({
      goals: [],
      meta: null,
      selectedGoal: null,
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
export const goalSelectors = {
  // Metas ativas
  getActiveGoals: (state: GoalsState) =>
    state.goals.filter((g) => g.status === 'active'),

  // Metas concluídas
  getCompletedGoals: (state: GoalsState) =>
    state.goals.filter((g) => g.status === 'completed'),

  // Metas por tipo
  getGoalsByType: (state: GoalsState, goalType: string) =>
    state.goals.filter((g) => g.goal_type === goalType),

  // Metas por prioridade
  getGoalsByPriority: (state: GoalsState, priority: string) =>
    state.goals.filter((g) => g.priority === priority),

  // Metas por categoria
  getGoalsByCategory: (state: GoalsState, categoryId: number) =>
    state.goals.filter((g) => g.category_id === categoryId),

  // Metas atrasadas
  getOverdueGoals: (state: GoalsState) =>
    state.goals.filter((g) => g['is_overdue?'] === true),

  // Metas fora do ritmo
  getOffTrackGoals: (state: GoalsState) =>
    state.goals.filter((g) => g['is_on_track?'] === false && g.status === 'active'),

  // Total alvo de metas ativas
  getTotalTargetAmount: (state: GoalsState) => {
    const activeGoals = state.goals.filter((g) => g.status === 'active');
    return activeGoals.reduce((sum, g) => {
      const target = typeof g.target_amount === 'string'
        ? parseFloat(g.target_amount)
        : g.target_amount;
      return sum + target;
    }, 0);
  },

  // Total atual de metas ativas
  getTotalCurrentAmount: (state: GoalsState) => {
    const activeGoals = state.goals.filter((g) => g.status === 'active');
    return activeGoals.reduce((sum, g) => {
      const current = typeof g.current_amount === 'string'
        ? parseFloat(g.current_amount)
        : g.current_amount;
      return sum + current;
    }, 0);
  },

  // Percentual geral de progresso
  getOverallProgress: (state: GoalsState) => {
    const activeGoals = state.goals.filter((g) => g.status === 'active');
    if (activeGoals.length === 0) return 0;

    const totalTarget = activeGoals.reduce((sum, g) => {
      const target = typeof g.target_amount === 'string'
        ? parseFloat(g.target_amount)
        : g.target_amount;
      return sum + target;
    }, 0);

    const totalCurrent = activeGoals.reduce((sum, g) => {
      const current = typeof g.current_amount === 'string'
        ? parseFloat(g.current_amount)
        : g.current_amount;
      return sum + current;
    }, 0);

    return totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
  },
};
