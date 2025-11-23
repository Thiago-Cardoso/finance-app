/**
 * Accounts Service
 *
 * Service para operações de contas na API.
 */

import { apiClient } from './client';
import type {
  Account,
  AccountFormData,
  AccountFilters,
  AccountsResponse,
  AccountResponse,
  AccountsSummary,
} from '@/shared/models/Account.model';

const ACCOUNTS_ENDPOINT = '/api/v1/accounts';

/**
 * Busca lista de contas
 */
export async function getAccounts(filters?: AccountFilters): Promise<Account[]> {
  try {
    const params: Record<string, string | boolean | undefined> = {};

    if (filters?.account_type) params.account_type = filters.account_type;
    if (filters?.is_active !== undefined) params.is_active = filters.is_active;

    const response = await apiClient.get<AccountsResponse>(ACCOUNTS_ENDPOINT, { params });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
}

/**
 * Busca uma conta específica por ID
 */
export async function getAccountById(id: string): Promise<Account> {
  try {
    const response = await apiClient.get<AccountResponse>(`${ACCOUNTS_ENDPOINT}/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching account:', error);
    throw error;
  }
}

/**
 * Cria uma nova conta
 */
export async function createAccount(data: AccountFormData): Promise<Account> {
  try {
    const response = await apiClient.post<AccountResponse>(ACCOUNTS_ENDPOINT, {
      account: data,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
}

/**
 * Atualiza uma conta existente
 */
export async function updateAccount(id: string, data: Partial<AccountFormData>): Promise<Account> {
  try {
    const response = await apiClient.patch<AccountResponse>(`${ACCOUNTS_ENDPOINT}/${id}`, {
      account: data,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
}

/**
 * Desativa uma conta (soft delete)
 */
export async function deactivateAccount(id: string): Promise<void> {
  try {
    await apiClient.patch(`${ACCOUNTS_ENDPOINT}/${id}/deactivate`);
  } catch (error) {
    console.error('Error deactivating account:', error);
    throw error;
  }
}

/**
 * Reativa uma conta
 */
export async function reactivateAccount(id: string): Promise<void> {
  try {
    await apiClient.patch(`${ACCOUNTS_ENDPOINT}/${id}/reactivate`);
  } catch (error) {
    console.error('Error reactivating account:', error);
    throw error;
  }
}

/**
 * Exclui uma conta permanentemente (apenas se não tiver transações)
 */
export async function deleteAccount(id: string): Promise<void> {
  try {
    await apiClient.delete(`${ACCOUNTS_ENDPOINT}/${id}`);
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}

/**
 * Busca saldo de uma conta
 */
export async function getAccountBalance(id: string): Promise<number> {
  try {
    const response = await apiClient.get<{ success: boolean; data: { balance: number } }>(
      `${ACCOUNTS_ENDPOINT}/${id}/balance`
    );
    return response.data.data.balance;
  } catch (error) {
    console.error('Error fetching account balance:', error);
    throw error;
  }
}

/**
 * Busca resumo das contas (saldo total, etc)
 */
export async function getAccountsSummary(): Promise<AccountsSummary> {
  try {
    const response = await apiClient.get<{ success: boolean; data: AccountsSummary }>(
      `${ACCOUNTS_ENDPOINT}/summary`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching accounts summary:', error);
    throw error;
  }
}

/**
 * Busca saldo total de todas as contas ativas
 */
export async function getTotalBalance(): Promise<number> {
  try {
    const response = await apiClient.get<{ success: boolean; data: { total_balance: number } }>(
      `${ACCOUNTS_ENDPOINT}/total_balance`
    );
    return response.data.data.total_balance;
  } catch (error) {
    console.error('Error fetching total balance:', error);
    throw error;
  }
}
