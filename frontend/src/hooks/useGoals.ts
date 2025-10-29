import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsService } from '@/services/goalsService';
import type {
  Goal,
  CreateGoalData,
  UpdateGoalData,
  CreateContributionData,
  GoalFilters,
} from '@/types/goal';
import { toast } from 'react-hot-toast';

export const GOALS_QUERY_KEY = 'goals';

export function useGoals(filters?: GoalFilters) {
  return useQuery({
    queryKey: [GOALS_QUERY_KEY, filters],
    queryFn: () => goalsService.getGoals(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useGoal(id: number | undefined) {
  return useQuery({
    queryKey: [GOALS_QUERY_KEY, id],
    queryFn: () => goalsService.getGoal(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoalData) => goalsService.createGoal(data),
    onSuccess: (newGoal) => {
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY] });
      toast.success('Meta criada com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao criar meta';
      toast.error(message);
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGoalData }) =>
      goalsService.updateGoal(id, data),
    onSuccess: (updatedGoal) => {
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY] });
      queryClient.setQueryData([GOALS_QUERY_KEY, updatedGoal.id], updatedGoal);
      toast.success('Meta atualizada com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao atualizar meta';
      toast.error(message);
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => goalsService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY] });
      toast.success('Meta excluída com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao excluir meta';
      toast.error(message);
    },
  });
}

export function useAddContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, data }: { goalId: number; data: CreateContributionData }) =>
      goalsService.addContribution(goalId, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY] });
      if (result?.goal) {
        queryClient.setQueryData([GOALS_QUERY_KEY, result.goal.id], result.goal);
      } else {
        // If goal is not in the response, invalidate the specific goal query
        queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY, variables.goalId] });
      }
      toast.success('Contribuição adicionada com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao adicionar contribuição';
      toast.error(message);
    },
  });
}
