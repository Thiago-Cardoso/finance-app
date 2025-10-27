import { apiClient as api } from '@/lib/api';
import type {
  Goal,
  GoalsListResponse,
  GoalResponse,
  ContributionResponse,
  CreateGoalData,
  UpdateGoalData,
  CreateContributionData,
  GoalFilters,
} from '@/types/goal';

class GoalsService {
  private readonly basePath = '/goals';

  async getGoals(filters?: GoalFilters): Promise<GoalsListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.goal_type) params.append('goal_type', filters.goal_type);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.category_id) params.append('category_id', filters.category_id.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    return api.get<GoalsListResponse>(url);
  }

  async getGoal(id: number): Promise<Goal> {
    const response = await api.get<GoalResponse>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  async createGoal(data: CreateGoalData): Promise<Goal> {
    const response = await api.post<GoalResponse>(this.basePath, { goal: data });
    return response.data.data;
  }

  async updateGoal(id: number, data: UpdateGoalData): Promise<Goal> {
    const response = await api.put<GoalResponse>(`${this.basePath}/${id}`, { goal: data });
    return response.data.data;
  }

  async deleteGoal(id: number): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async addContribution(goalId: number, data: CreateContributionData): Promise<ContributionResponse['data']> {
    const response = await api.post<ContributionResponse>(
      `${this.basePath}/${goalId}/contributions`,
      { contribution: data }
    );
    return response.data.data;
  }

  async updateProgress(goalId: number): Promise<Goal> {
    const response = await api.put<GoalResponse>(`${this.basePath}/${goalId}/update_progress`, {});
    return response.data.data;
  }
}

export const goalsService = new GoalsService();
