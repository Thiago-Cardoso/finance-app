/**
 * Budgets Service
 *
 * Service para operações de orçamentos na API.
 */

import { apiClient } from './client';
import type {
  Budget,
  BudgetFormData,
  BudgetFilters,
  BudgetsResponse,
  BudgetResponse,
  BudgetAlert,
  BudgetAlertsResponse,
  BudgetsSummary,
} from '@/shared/models/Budget.model';

const BUDGETS_ENDPOINT = '/api/v1/budgets';

/**
 * Busca lista de orçamentos
 */
export async function getBudgets(filters?: BudgetFilters): Promise<Budget[]> {
  try {
    const params: Record<string, string | number | boolean | undefined> = {};

    if (filters?.period_start) params.period_start = filters.period_start;
    if (filters?.period_end) params.period_end = filters.period_end;
    if (filters?.category_id) params.category_id = filters.category_id;
    if (filters?.status) params.status = filters.status;
    if (filters?.include_expired !== undefined) params.include_expired = filters.include_expired;

    const response = await apiClient.get<BudgetsResponse>(BUDGETS_ENDPOINT, { params });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
}

/**
 * Busca orçamentos do mês atual
 */
export async function getCurrentBudgets(): Promise<Budget[]> {
  try {
    const response = await apiClient.get<BudgetsResponse>(`${BUDGETS_ENDPOINT}/current`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching current budgets:', error);
    throw error;
  }
}

/**
 * Busca um orçamento específico por ID
 */
export async function getBudgetById(id: number): Promise<Budget> {
  try {
    const response = await apiClient.get<BudgetResponse>(`${BUDGETS_ENDPOINT}/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching budget:', error);
    throw error;
  }
}

/**
 * Cria um novo orçamento
 */
export async function createBudget(data: BudgetFormData): Promise<Budget> {
  try {
    const response = await apiClient.post<BudgetResponse>(BUDGETS_ENDPOINT, {
      budget: data,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating budget:', error);
    throw error;
  }
}

/**
 * Atualiza um orçamento existente
 */
export async function updateBudget(id: number, data: Partial<BudgetFormData>): Promise<Budget> {
  try {
    const response = await apiClient.patch<BudgetResponse>(`${BUDGETS_ENDPOINT}/${id}`, {
      budget: data,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
}

/**
 * Exclui um orçamento
 */
export async function deleteBudget(id: number): Promise<void> {
  try {
    await apiClient.delete(`${BUDGETS_ENDPOINT}/${id}`);
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
}

/**
 * Busca alertas de orçamentos
 */
export async function getBudgetAlerts(): Promise<BudgetAlert[]> {
  try {
    const response = await apiClient.get<BudgetAlertsResponse>(`${BUDGETS_ENDPOINT}/alerts`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching budget alerts:', error);
    throw error;
  }
}

/**
 * Marca alerta como lido
 */
export async function markAlertAsRead(alertId: number): Promise<void> {
  try {
    await apiClient.patch(`${BUDGETS_ENDPOINT}/alerts/${alertId}/read`);
  } catch (error) {
    console.error('Error marking alert as read:', error);
    throw error;
  }
}

/**
 * Busca resumo de orçamentos
 */
export async function getBudgetsSummary(): Promise<BudgetsSummary> {
  try {
    const response = await apiClient.get<{ success: boolean; data: BudgetsSummary }>(
      `${BUDGETS_ENDPOINT}/summary`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching budgets summary:', error);
    throw error;
  }
}

/**
 * Busca histórico de orçamentos (meses anteriores)
 */
export async function getBudgetHistory(
  categoryId?: number,
  months: number = 6
): Promise<Budget[]> {
  try {
    const params: Record<string, number | undefined> = {
      months,
    };
    if (categoryId) params.category_id = categoryId;

    const response = await apiClient.get<BudgetsResponse>(`${BUDGETS_ENDPOINT}/history`, {
      params,
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching budget history:', error);
    throw error;
  }
}

/**
 * Duplica orçamento para próximo período
 */
export async function duplicateBudget(id: number): Promise<Budget> {
  try {
    const response = await apiClient.post<BudgetResponse>(`${BUDGETS_ENDPOINT}/${id}/duplicate`);
    return response.data.data;
  } catch (error) {
    console.error('Error duplicating budget:', error);
    throw error;
  }
}
