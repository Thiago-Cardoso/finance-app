/**
 * Goals Service
 *
 * Service para operações de metas financeiras na API.
 */

import { apiClient } from './client';
import { isGoalsMockEnabled, getGoalsMockDelay, simulateDelay } from '@/shared/config/mock.config';
import {
  mockGoalsListResponse,
  mockGoals,
  generateMockGoal,
  generateMockContribution,
} from '@/shared/services/mocks/goals.mock';
import type {
  Goal,
  GoalsListResponse,
  CreateGoalData,
  UpdateGoalData,
  CreateContributionData,
  GoalFilters,
} from '@/shared/models/Goal.model';

const GOALS_ENDPOINT = '/api/v1/goals';

// In-memory storage for mock data
let mockGoalsData: Goal[] = [...mockGoals];
let nextMockId = 1000;

/**
 * Busca lista de metas com filtros opcionais
 */
export async function getGoals(filters?: GoalFilters): Promise<GoalsListResponse> {
  // Use mock data if enabled
  if (isGoalsMockEnabled()) {
    await simulateDelay(getGoalsMockDelay());

    let filteredGoals = [...mockGoalsData];

    // Apply filters
    if (filters?.status) {
      filteredGoals = filteredGoals.filter((g) => g.status === filters.status);
    }
    if (filters?.goal_type) {
      filteredGoals = filteredGoals.filter((g) => g.goal_type === filters.goal_type);
    }
    if (filters?.priority) {
      filteredGoals = filteredGoals.filter((g) => g.priority === filters.priority);
    }
    if (filters?.category_id) {
      filteredGoals = filteredGoals.filter((g) => g.category_id === filters.category_id);
    }

    // Calculate meta
    const activeGoals = filteredGoals.filter((g) => g.status === 'active');
    const completedGoals = filteredGoals.filter((g) => g.status === 'completed');

    const totalTarget = activeGoals.reduce((sum, g) => {
      const amount = typeof g.target_amount === 'string' ? parseFloat(g.target_amount) : g.target_amount;
      return sum + amount;
    }, 0);

    const totalCurrent = activeGoals.reduce((sum, g) => {
      const amount = typeof g.current_amount === 'string' ? parseFloat(g.current_amount) : g.current_amount;
      return sum + amount;
    }, 0);

    return {
      success: true,
      data: filteredGoals,
      meta: {
        total_count: filteredGoals.length,
        active_count: activeGoals.length,
        completed_count: completedGoals.length,
        total_target_amount: totalTarget,
        total_current_amount: totalCurrent,
      },
    };
  }

  // Use real API
  try {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.goal_type) params.append('goal_type', filters.goal_type);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.category_id) params.append('category_id', filters.category_id.toString());

    const queryString = params.toString();
    const url = queryString ? `${GOALS_ENDPOINT}?${queryString}` : GOALS_ENDPOINT;

    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
}

/**
 * Busca uma meta específica por ID
 */
export async function getGoal(id: number): Promise<Goal> {
  // Use mock data if enabled
  if (isGoalsMockEnabled()) {
    await simulateDelay(getGoalsMockDelay());

    const goal = mockGoalsData.find((g) => g.id === id);
    if (!goal) {
      throw new Error('Goal not found');
    }
    return goal;
  }

  // Use real API
  try {
    const response = await apiClient.get(`${GOALS_ENDPOINT}/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching goal:', error);
    throw error;
  }
}

/**
 * Cria uma nova meta
 */
export async function createGoal(data: CreateGoalData): Promise<Goal> {
  // Use mock data if enabled
  if (isGoalsMockEnabled()) {
    await simulateDelay(getGoalsMockDelay());

    const newGoal = generateMockGoal(data);
    newGoal.id = nextMockId++;
    mockGoalsData = [newGoal, ...mockGoalsData];

    return newGoal;
  }

  // Use real API
  try {
    const response = await apiClient.post(GOALS_ENDPOINT, {
      goal: data,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
}

/**
 * Atualiza uma meta existente
 */
export async function updateGoal(id: number, data: Partial<UpdateGoalData>): Promise<Goal> {
  // Use mock data if enabled
  if (isGoalsMockEnabled()) {
    await simulateDelay(getGoalsMockDelay());

    const goalIndex = mockGoalsData.findIndex((g) => g.id === id);
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }

    const updatedGoal = { ...mockGoalsData[goalIndex], ...data };
    mockGoalsData[goalIndex] = updatedGoal;

    return updatedGoal;
  }

  // Use real API
  try {
    const response = await apiClient.patch(`${GOALS_ENDPOINT}/${id}`, {
      goal: data,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
}

/**
 * Exclui uma meta
 */
export async function deleteGoal(id: number): Promise<void> {
  // Use mock data if enabled
  if (isGoalsMockEnabled()) {
    await simulateDelay(getGoalsMockDelay());

    mockGoalsData = mockGoalsData.filter((g) => g.id !== id);
    return;
  }

  // Use real API
  try {
    await apiClient.delete(`${GOALS_ENDPOINT}/${id}`);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
}

/**
 * Adiciona uma contribuição manual a uma meta
 */
export async function addContribution(
  goalId: number,
  data: CreateContributionData
): Promise<{ contribution: any; goal: Goal }> {
  // Use mock data if enabled
  if (isGoalsMockEnabled()) {
    await simulateDelay(getGoalsMockDelay());

    const goalIndex = mockGoalsData.findIndex((g) => g.id === goalId);
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }

    const contribution = generateMockContribution(data.amount, data.description);
    const goal = mockGoalsData[goalIndex];

    // Update current amount
    const currentAmount =
      typeof goal.current_amount === 'string'
        ? parseFloat(goal.current_amount)
        : goal.current_amount;
    const targetAmount =
      typeof goal.target_amount === 'string'
        ? parseFloat(goal.target_amount)
        : goal.target_amount;

    const newCurrentAmount = currentAmount + data.amount;
    const newProgress = (newCurrentAmount / targetAmount) * 100;

    mockGoalsData[goalIndex] = {
      ...goal,
      current_amount: newCurrentAmount,
      progress_percentage: newProgress,
      remaining_amount: targetAmount - newCurrentAmount,
      goal_contributions: [
        ...(goal.goal_contributions || []),
        contribution,
      ],
    };

    return {
      contribution,
      goal: mockGoalsData[goalIndex],
    };
  }

  // Use real API
  try {
    const response = await apiClient.post(`${GOALS_ENDPOINT}/${goalId}/contributions`, {
      contribution: data,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error adding contribution:', error);
    throw error;
  }
}
