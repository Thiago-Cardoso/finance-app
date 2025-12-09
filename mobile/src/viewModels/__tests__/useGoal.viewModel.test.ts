/**
 * Tests for useGoalViewModel
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useGoalViewModel } from '../useGoal.viewModel';
import * as goalsService from '@/shared/services/api/goals.service';
import { useGoalsStore } from '@/shared/stores/goalsStore';

// Mock do service
jest.mock('@/shared/services/api/goals.service');

// Mock do Zustand store
jest.mock('@/shared/stores/goalsStore');

describe('useGoalViewModel', () => {
  const mockGoal = {
    id: 1,
    name: 'Test Goal',
    description: 'Test description',
    target_amount: 1000,
    current_amount: 500,
    target_date: '2025-12-31',
    user_id: 1,
    is_achieved: false,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    goal_type: 'savings' as const,
    priority: 'high' as const,
    status: 'active' as const,
    category_id: null,
    baseline_amount: null,
    completed_at: null,
    auto_track_progress: false,
    progress_percentage: 50,
    remaining_amount: 500,
    days_remaining: 365,
    'is_overdue?': false,
    'is_on_track?': true,
  };

  const mockMeta = {
    total_count: 1,
    active_count: 1,
    completed_count: 0,
    total_target_amount: 1000,
    total_current_amount: 500,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock store
    (useGoalsStore as unknown as jest.Mock).mockReturnValue({
      goals: [],
      meta: null,
      selectedGoal: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
      setGoals: jest.fn(),
      setMeta: jest.fn(),
      setSelectedGoal: jest.fn(),
      addGoal: jest.fn(),
      updateGoal: jest.fn(),
      removeGoal: jest.fn(),
      setLoading: jest.fn(),
      setRefreshing: jest.fn(),
      setError: jest.fn(),
      clearCache: jest.fn(),
    });

    (useGoalsStore.getState as jest.Mock) = jest.fn().mockReturnValue({
      goals: [],
      isCacheValid: jest.fn().mockReturnValue(false),
    });
  });

  describe('loadGoals', () => {
    it('should load goals successfully', async () => {
      const mockResponse = {
        success: true,
        data: [mockGoal],
        meta: mockMeta,
      };

      (goalsService.getGoals as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGoalViewModel());

      await act(async () => {
        await result.current.loadGoals();
      });

      expect(goalsService.getGoals).toHaveBeenCalled();
    });

    it('should handle error when loading goals fails', async () => {
      const mockError = new Error('Network error');
      (goalsService.getGoals as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useGoalViewModel());

      await act(async () => {
        await result.current.loadGoals();
      });

      // Should handle error gracefully
      expect(goalsService.getGoals).toHaveBeenCalled();
    });
  });

  describe('createGoal', () => {
    it('should create goal successfully', async () => {
      (goalsService.createGoal as jest.Mock).mockResolvedValue(mockGoal);

      const { result } = renderHook(() => useGoalViewModel());

      const goalData = {
        name: 'New Goal',
        target_amount: 1000,
        target_date: '2025-12-31',
        goal_type: 'savings' as const,
        priority: 'medium' as const,
      };

      let createResult;
      await act(async () => {
        createResult = await result.current.createGoal(goalData);
      });

      expect(createResult).toEqual({ success: true, goal: mockGoal });
      expect(goalsService.createGoal).toHaveBeenCalledWith(goalData);
    });

    it('should handle error when creating goal fails', async () => {
      const mockError = { response: { data: { message: 'Validation error' } } };
      (goalsService.createGoal as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useGoalViewModel());

      const goalData = {
        name: 'New Goal',
        target_amount: 1000,
        target_date: '2025-12-31',
        goal_type: 'savings' as const,
        priority: 'medium' as const,
      };

      let createResult;
      await act(async () => {
        createResult = await result.current.createGoal(goalData);
      });

      expect(createResult?.success).toBe(false);
      expect(createResult?.error).toBe('Validation error');
    });
  });

  describe('updateGoal', () => {
    it('should update goal successfully', async () => {
      const updatedGoal = { ...mockGoal, name: 'Updated Goal' };
      (goalsService.updateGoal as jest.Mock).mockResolvedValue(updatedGoal);

      const { result } = renderHook(() => useGoalViewModel());

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateGoal(1, { name: 'Updated Goal' });
      });

      expect(updateResult).toEqual({ success: true, goal: updatedGoal });
      expect(goalsService.updateGoal).toHaveBeenCalledWith(1, { name: 'Updated Goal' });
    });
  });

  describe('deleteGoal', () => {
    it('should delete goal successfully', async () => {
      (goalsService.deleteGoal as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useGoalViewModel());

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteGoal(1);
      });

      expect(deleteResult).toEqual({ success: true });
      expect(goalsService.deleteGoal).toHaveBeenCalledWith(1);
    });
  });

  describe('addContribution', () => {
    it('should add contribution successfully', async () => {
      const mockResponse = {
        contribution: { id: 1, amount: 100, description: 'Test' },
        goal: mockGoal,
      };
      (goalsService.addContribution as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGoalViewModel());

      let contributionResult;
      await act(async () => {
        contributionResult = await result.current.addContribution(1, {
          amount: 100,
          description: 'Test',
        });
      });

      expect(contributionResult).toEqual({ success: true });
      expect(goalsService.addContribution).toHaveBeenCalledWith(1, {
        amount: 100,
        description: 'Test',
      });
    });
  });

  describe('computed values', () => {
    it('should correctly compute active goals', () => {
      const mockActiveGoals = [mockGoal];
      (useGoalsStore as unknown as jest.Mock).mockReturnValue({
        goals: mockActiveGoals,
        meta: mockMeta,
        selectedGoal: null,
        isLoading: false,
        isRefreshing: false,
        error: null,
      });

      const { result } = renderHook(() => useGoalViewModel());

      expect(result.current.activeGoals).toEqual(mockActiveGoals);
    });

    it('should correctly compute total amounts', () => {
      const mockActiveGoals = [mockGoal];
      (useGoalsStore as unknown as jest.Mock).mockReturnValue({
        goals: mockActiveGoals,
        meta: mockMeta,
        selectedGoal: null,
        isLoading: false,
        isRefreshing: false,
        error: null,
      });

      const { result } = renderHook(() => useGoalViewModel());

      expect(result.current.totalTargetAmount).toBe(1000);
      expect(result.current.totalCurrentAmount).toBe(500);
      expect(result.current.overallProgress).toBe(50);
    });
  });
});
