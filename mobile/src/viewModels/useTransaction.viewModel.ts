/**
 * ViewModel: Transaction
 *
 * Lógica de apresentação para transações.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  useTransactionsStore,
  useTransactionsList,
  useTransactionsLoading,
  useTransactionsPagination,
  useTransactionsFilters,
} from '@/shared/stores/transactionsStore';
import transactionsService from '@/shared/services/api/transactions.service';
import type {
  Transaction,
  TransactionFilters,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionType,
} from '@/shared/models/Transaction.model';

export function useTransactionViewModel() {
  // Use stable selector hooks to prevent infinite loops
  const transactions = useTransactionsList();
  const storeLoading = useTransactionsLoading();
  const pagination = useTransactionsPagination();
  const currentFilters = useTransactionsFilters();

  // Get remaining state from store using selectors
  const summary = useTransactionsStore((state) => state.summary);
  const filterOptions = useTransactionsStore((state) => state.filterOptions);
  const isLoadingMore = useTransactionsStore((state) => state.isLoadingMore);
  const isSummaryLoading = useTransactionsStore((state) => state.isSummaryLoading);
  const storeError = useTransactionsStore((state) => state.error);

  // Get stable action references using selectors
  const fetchTransactions = useTransactionsStore((state) => state.fetchTransactions);
  const fetchNextPage = useTransactionsStore((state) => state.fetchNextPage);
  const fetchSummary = useTransactionsStore((state) => state.fetchSummary);
  const fetchFilterOptions = useTransactionsStore((state) => state.fetchFilterOptions);
  const addTransaction = useTransactionsStore((state) => state.addTransaction);
  const updateTransactionInStore = useTransactionsStore((state) => state.updateTransaction);
  const removeTransaction = useTransactionsStore((state) => state.removeTransaction);
  const setFilters = useTransactionsStore((state) => state.setFilters);
  const clearFilters = useTransactionsStore((state) => state.clearFilters);
  const clearError = useTransactionsStore((state) => state.clearError);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Load transactions from API
   */
  const loadTransactions = useCallback(
    async (filters?: TransactionFilters, forceRefresh = false) => {
      if (forceRefresh) {
        useTransactionsStore.setState({ lastFetched: null });
      }
      await fetchTransactions(filters);
    },
    [fetchTransactions]
  );

  /**
   * Load more transactions (pagination)
   */
  const loadMore = useCallback(async () => {
    await fetchNextPage();
  }, [fetchNextPage]);

  /**
   * Load transaction summary
   */
  const loadSummary = useCallback(
    async (startDate?: string, endDate?: string) => {
      await fetchSummary(startDate, endDate);
    },
    [fetchSummary]
  );

  /**
   * Load filter options
   */
  const loadFilterOptions = useCallback(async () => {
    await fetchFilterOptions();
  }, [fetchFilterOptions]);

  /**
   * Create a new transaction
   */
  const createTransaction = useCallback(
    async (data: CreateTransactionData): Promise<{ success: boolean; transaction?: Transaction }> => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const newTransaction = await transactionsService.createTransaction(data);
        addTransaction(newTransaction);
        return { success: true, transaction: newTransaction };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao criar transação';
        setSubmitError(message);
        return { success: false };
      } finally {
        setIsSubmitting(false);
      }
    },
    [addTransaction]
  );

  /**
   * Update an existing transaction
   */
  const updateTransaction = useCallback(
    async (
      id: string,
      data: UpdateTransactionData
    ): Promise<{ success: boolean; transaction?: Transaction }> => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const updatedTransaction = await transactionsService.updateTransaction(id, data);
        updateTransactionInStore(id, updatedTransaction);
        return { success: true, transaction: updatedTransaction };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao atualizar transação';
        setSubmitError(message);
        return { success: false };
      } finally {
        setIsSubmitting(false);
      }
    },
    [updateTransactionInStore]
  );

  /**
   * Delete a transaction
   */
  const deleteTransaction = useCallback(
    async (id: string): Promise<{ success: boolean }> => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        await transactionsService.deleteTransaction(id);
        removeTransaction(id);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao deletar transação';
        setSubmitError(message);
        return { success: false };
      } finally {
        setIsSubmitting(false);
      }
    },
    [removeTransaction]
  );

  /**
   * Apply filters
   */
  const applyFilters = useCallback(
    async (filters: TransactionFilters) => {
      // Calculate new filters first to avoid race conditions with store updates
      const currentFilters = useTransactionsStore.getState().filters;
      const newFilters = { ...currentFilters, ...filters, page: 1 };
      
      setFilters(filters);
      await fetchTransactions(newFilters);
    },
    [setFilters, fetchTransactions]
  );

  /**
   * Reset filters to default
   */
  const resetFilters = useCallback(async () => {
    clearFilters();
    await fetchTransactions({ page: 1, per_page: 20 });
  }, [clearFilters, fetchTransactions]);

  /**
   * Filter by type
   */
  const filterByType = useCallback(
    async (type: TransactionType | null) => {
      const filters: TransactionFilters = type
        ? { transaction_type: type }
        : {};
      await applyFilters(filters);
    },
    [applyFilters]
  );

  /**
   * Filter by period
   */
  const filterByPeriod = useCallback(
    async (period: 'this_month' | 'last_month' | 'this_year' | 'last_year') => {
      await applyFilters({ period });
    },
    [applyFilters]
  );

  /**
   * Search transactions
   */
  const searchTransactions = useCallback(
    async (query: string) => {
      await applyFilters({ search: query });
    },
    [applyFilters]
  );

  /**
   * Clear any errors
   */
  const clearErrors = useCallback(() => {
    clearError();
    setSubmitError(null);
  }, [clearError]);

  /**
   * Format amount for display
   */
  const formatAmount = useCallback((amount: number, type: TransactionType): string => {
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);

    return type === 'expense' ? `-${formatted}` : formatted;
  }, []);

  /**
   * Get transaction color based on type
   */
  const getTransactionColor = useCallback((type: TransactionType): string => {
    switch (type) {
      case 'income':
        return '#10B981'; // green
      case 'expense':
        return '#EF4444'; // red
      case 'transfer':
        return '#3B82F6'; // blue
      default:
        return '#6B7280'; // gray
    }
  }, []);

  /**
   * Memoized selector: Get transaction by ID
   */
  const getTransactionById = useCallback(
    (id: string) => transactions.find((t) => t.id === id),
    [transactions]
  );

  /**
   * Memoized selector: Get transactions by type
   */
  const getTransactionsByType = useCallback(
    (type: TransactionType) => transactions.filter((t) => t.transaction_type === type),
    [transactions]
  );

  /**
   * Memoized selector: Check if there are more pages
   */
  const hasMorePages = useMemo(
    () => !!pagination?.next_page,
    [pagination]
  );

  return {
    // State
    transactions,
    summary,
    filterOptions,
    pagination,
    currentFilters,
    isLoading: storeLoading || isSubmitting,
    isLoadingMore,
    isSummaryLoading,
    error: storeError || submitError,

    // Actions
    loadTransactions,
    loadMore,
    loadSummary,
    loadFilterOptions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    applyFilters,
    resetFilters,
    filterByType,
    filterByPeriod,
    searchTransactions,
    clearErrors,

    // Selectors
    getTransactionById,
    getTransactionsByType,
    hasMorePages,

    // Helpers
    formatAmount,
    getTransactionColor,
  };
}

export default useTransactionViewModel;
