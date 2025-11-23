/**
 * Store: Transactions
 *
 * Zustand store for managing transactions state.
 */

import { create } from 'zustand';
import type {
  Transaction,
  TransactionFilters,
  TransactionSummary,
  PaginationMeta,
  FilterOptions,
} from '@/shared/models/Transaction.model';
import transactionsService from '@/shared/services/api/transactions.service';

interface TransactionsState {
  // Data
  transactions: Transaction[];
  summary: TransactionSummary | null;
  filterOptions: FilterOptions | null;
  pagination: PaginationMeta | null;

  // Filters
  currentFilters: TransactionFilters;

  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;
  isSummaryLoading: boolean;

  // Error state
  error: string | null;

  // Cache
  lastFetched: number | null;

  // Actions
  fetchTransactions: (filters?: TransactionFilters, append?: boolean) => Promise<void>;
  fetchNextPage: () => Promise<void>;
  fetchSummary: (startDate?: string, endDate?: string) => Promise<void>;
  fetchFilterOptions: () => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  setFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
  reset: () => void;

  // Selectors
  getTransactionById: (id: string) => Transaction | undefined;
  getTransactionsByType: (type: 'income' | 'expense' | 'transfer') => Transaction[];
  hasMorePages: () => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEFAULT_PER_PAGE = 20;

const initialFilters: TransactionFilters = {
  page: 1,
  per_page: DEFAULT_PER_PAGE,
  sort_by: 'date',
  sort_direction: 'desc',
};

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  // Initial state
  transactions: [],
  summary: null,
  filterOptions: null,
  pagination: null,
  currentFilters: initialFilters,
  isLoading: false,
  isLoadingMore: false,
  isSummaryLoading: false,
  error: null,
  lastFetched: null,

  fetchTransactions: async (filters?: TransactionFilters, append = false) => {
    const { lastFetched, transactions, currentFilters } = get();
    const mergedFilters = { ...currentFilters, ...filters };

    // Check cache only if no filters changed and not appending
    if (
      !append &&
      !filters &&
      lastFetched &&
      Date.now() - lastFetched < CACHE_DURATION &&
      transactions.length > 0
    ) {
      return;
    }

    set({
      isLoading: !append,
      isLoadingMore: append,
      error: null,
      currentFilters: mergedFilters,
    });

    try {
      const result = await transactionsService.getTransactions(mergedFilters);

      set((state) => ({
        transactions: append ? [...state.transactions, ...result.data] : result.data,
        pagination: result.meta?.pagination || null,
        isLoading: false,
        isLoadingMore: false,
        lastFetched: Date.now(),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar transações',
        isLoading: false,
        isLoadingMore: false,
      });
    }
  },

  fetchNextPage: async () => {
    const { pagination, currentFilters, isLoadingMore, isLoading } = get();

    if (isLoading || isLoadingMore || !pagination?.next_page) {
      return;
    }

    const nextFilters = {
      ...currentFilters,
      page: pagination.next_page,
    };

    await get().fetchTransactions(nextFilters, true);
  },

  fetchSummary: async (startDate?: string, endDate?: string) => {
    set({ isSummaryLoading: true, error: null });

    try {
      const summary = await transactionsService.getTransactionSummary(startDate, endDate);
      set({ summary, isSummaryLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar resumo',
        isSummaryLoading: false,
      });
    }
  },

  fetchFilterOptions: async () => {
    try {
      const options = await transactionsService.getFilterOptions();
      set({ filterOptions: options });
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  },

  addTransaction: (transaction: Transaction) => {
    set((state) => ({
      transactions: [transaction, ...state.transactions],
      pagination: state.pagination
        ? { ...state.pagination, total_count: state.pagination.total_count + 1 }
        : null,
    }));
  },

  updateTransaction: (id: string, updatedData: Partial<Transaction>) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updatedData } : t
      ),
    }));
  },

  removeTransaction: (id: string) => {
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
      pagination: state.pagination
        ? { ...state.pagination, total_count: state.pagination.total_count - 1 }
        : null,
    }));
  },

  setFilters: (filters: TransactionFilters) => {
    set((state) => ({
      currentFilters: { ...state.currentFilters, ...filters, page: 1 },
      lastFetched: null, // Force refetch
    }));
  },

  clearFilters: () => {
    set({
      currentFilters: initialFilters,
      lastFetched: null,
    });
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      transactions: [],
      summary: null,
      filterOptions: null,
      pagination: null,
      currentFilters: initialFilters,
      isLoading: false,
      isLoadingMore: false,
      isSummaryLoading: false,
      error: null,
      lastFetched: null,
    }),

  // Selectors
  getTransactionById: (id: string) => {
    const { transactions } = get();
    return transactions.find((t) => t.id === id);
  },

  getTransactionsByType: (type: 'income' | 'expense' | 'transfer') => {
    const { transactions } = get();
    return transactions.filter((t) => t.transaction_type === type);
  },

  hasMorePages: () => {
    const { pagination } = get();
    return !!pagination?.next_page;
  },
}));

export default useTransactionsStore;
