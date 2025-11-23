/**
 * ViewModel: Transaction
 *
 * Lógica de apresentação para transações.
 */

import { useState, useCallback } from 'react';
import { useTransactionsStore } from '@/shared/stores/transactionsStore';
import transactionsService from '@/shared/services/api/transactions.service';
import type {
  Transaction,
  TransactionFilters,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionType,
} from '@/shared/models/Transaction.model';

export function useTransactionViewModel() {
  const {
    transactions,
    summary,
    filterOptions,
    pagination,
    currentFilters,
    isLoading: storeLoading,
    isLoadingMore,
    isSummaryLoading,
    error: storeError,
    fetchTransactions,
    fetchNextPage,
    fetchSummary,
    fetchFilterOptions,
    addTransaction,
    updateTransaction: updateTransactionInStore,
    removeTransaction,
    setFilters,
    clearFilters,
    clearError,
    getTransactionById,
    getTransactionsByType,
    hasMorePages,
  } = useTransactionsStore();

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
      setFilters(filters);
      await fetchTransactions({ ...currentFilters, ...filters, page: 1 });
    },
    [setFilters, fetchTransactions, currentFilters]
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
