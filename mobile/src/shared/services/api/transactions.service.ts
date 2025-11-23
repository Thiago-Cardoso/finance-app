/**
 * Service: Transactions
 *
 * API service for transaction management.
 */

import { apiClient } from './client';
import type {
  Transaction,
  TransactionsResponse,
  TransactionResponse,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionFilters,
  TransactionSummary,
  TransactionSummaryResponse,
  FilterOptions,
  FilterOptionsResponse,
} from '@/shared/models/Transaction.model';

const ENDPOINT = '/api/v1/transactions';

/**
 * Get all transactions with optional filters and pagination
 */
export async function getTransactions(
  filters?: TransactionFilters
): Promise<{ data: Transaction[]; meta: TransactionsResponse['meta'] }> {
  const params: Record<string, unknown> = {};

  if (filters) {
    if (filters.category_id) params.category_id = filters.category_id;
    if (filters.category_ids?.length) params.category_ids = filters.category_ids;
    if (filters.transaction_type) params.transaction_type = filters.transaction_type;
    if (filters.account_id) params.account_id = filters.account_id;
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    if (filters.search) params.search = filters.search;
    if (filters.min_amount) params.min_amount = filters.min_amount;
    if (filters.max_amount) params.max_amount = filters.max_amount;
    if (filters.period) params.period = filters.period;
    if (filters.sort_by) params.sort_by = filters.sort_by;
    if (filters.sort_direction) params.sort_direction = filters.sort_direction;
    if (filters.page) params.page = filters.page;
    if (filters.per_page) params.per_page = filters.per_page;
  }

  const response = await apiClient.get<TransactionsResponse>(ENDPOINT, { params });
  return {
    data: response.data.data,
    meta: response.data.meta,
  };
}

/**
 * Get a single transaction by ID
 */
export async function getTransaction(id: string): Promise<Transaction> {
  const response = await apiClient.get<TransactionResponse>(`${ENDPOINT}/${id}`);
  return response.data.data;
}

/**
 * Create a new transaction
 */
export async function createTransaction(data: CreateTransactionData): Promise<Transaction> {
  const response = await apiClient.post<TransactionResponse>(ENDPOINT, {
    transaction: data,
  });
  return response.data.data;
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  id: string,
  data: UpdateTransactionData
): Promise<Transaction> {
  const response = await apiClient.patch<TransactionResponse>(`${ENDPOINT}/${id}`, {
    transaction: data,
  });
  return response.data.data;
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string): Promise<void> {
  await apiClient.delete(`${ENDPOINT}/${id}`);
}

/**
 * Get transaction summary for a period
 */
export async function getTransactionSummary(
  startDate?: string,
  endDate?: string
): Promise<TransactionSummary> {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  const response = await apiClient.get<TransactionSummaryResponse>(`${ENDPOINT}/summary`, {
    params,
  });
  return response.data.data;
}

/**
 * Search transactions with full-text search
 */
export async function searchTransactions(
  query: string,
  filters?: TransactionFilters
): Promise<{ data: Transaction[]; meta: TransactionsResponse['meta'] }> {
  const params: Record<string, unknown> = {
    search: query,
    ...filters,
  };

  const response = await apiClient.get<TransactionsResponse>(`${ENDPOINT}/search`, { params });
  return {
    data: response.data.data,
    meta: response.data.meta,
  };
}

/**
 * Get filter options (categories, accounts, etc.)
 */
export async function getFilterOptions(): Promise<FilterOptions> {
  const response = await apiClient.get<FilterOptionsResponse>(`${ENDPOINT}/filter_options`);
  return response.data.data;
}

/**
 * Get search suggestions based on query
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
  const response = await apiClient.get<{ success: boolean; data: string[] }>(
    `${ENDPOINT}/search_suggestions`,
    { params: { query } }
  );
  return response.data.data;
}

export const transactionsService = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  searchTransactions,
  getFilterOptions,
  getSearchSuggestions,
};

export default transactionsService;
