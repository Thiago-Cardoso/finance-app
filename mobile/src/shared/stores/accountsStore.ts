/**
 * Accounts Store
 *
 * Zustand store para gerenciamento de estado de contas.
 */

import { create } from 'zustand';
import type { Account, AccountFilters } from '@/shared/models/Account.model';
import * as accountsService from '@/shared/services/api/accounts.service';

interface AccountsState {
  // Data
  accounts: Account[];
  selectedAccount: Account | null;
  filters: AccountFilters;

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Cache
  lastFetch: number | null;
  cacheTimeout: number; // em ms

  // Actions
  fetchAccounts: (filters?: AccountFilters) => Promise<void>;
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Account) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  removeAccount: (id: string) => void;
  setSelectedAccount: (account: Account | null) => void;
  setFilters: (filters: AccountFilters) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setError: (error: string | null) => void;
  isCacheValid: () => boolean;
  invalidateCache: () => void;
  reset: () => void;
}

const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutos

const initialState = {
  accounts: [],
  selectedAccount: null,
  filters: {},
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetch: null,
  cacheTimeout: CACHE_TIMEOUT,
};

export const useAccountsStore = create<AccountsState>((set, get) => ({
  ...initialState,

  fetchAccounts: async (filters?: AccountFilters) => {
    const { lastFetch, cacheTimeout, accounts } = get();

    // Check cache
    if (lastFetch && Date.now() - lastFetch < cacheTimeout && accounts.length > 0 && !filters) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const result = await accountsService.getAccounts(filters);
      set({
        accounts: result,
        lastFetch: Date.now(),
        isLoading: false,
      });
    } catch (err: any) {
      // Se for 404, significa que a API ainda não existe
      if (err?.response?.status === 404) {
        set({ accounts: [], isLoading: false });
      } else {
        set({
          error: err?.response?.data?.error || 'Erro ao carregar contas',
          isLoading: false,
        });
      }
    }
  },

  setAccounts: (accounts) =>
    set({
      accounts,
      lastFetch: Date.now(),
      error: null,
    }),

  addAccount: (account) =>
    set((state) => ({
      accounts: [account, ...state.accounts],
    })),

  updateAccount: (id, updatedData) =>
    set((state) => ({
      accounts: state.accounts.map((account) =>
        account.id === id ? { ...account, ...updatedData } : account
      ),
      selectedAccount:
        state.selectedAccount?.id === id
          ? { ...state.selectedAccount, ...updatedData }
          : state.selectedAccount,
    })),

  removeAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((account) => account.id !== id),
      selectedAccount:
        state.selectedAccount?.id === id ? null : state.selectedAccount,
    })),

  setSelectedAccount: (account) => set({ selectedAccount: account }),

  setFilters: (filters) => set({ filters }),

  setLoading: (isLoading) => set({ isLoading }),

  setRefreshing: (isRefreshing) => set({ isRefreshing }),

  setError: (error) => set({ error }),

  isCacheValid: () => {
    const { lastFetch, cacheTimeout } = get();
    if (!lastFetch) return false;
    return Date.now() - lastFetch < cacheTimeout;
  },

  invalidateCache: () => set({ lastFetch: null }),

  reset: () => set(initialState),
}));

/**
 * Seletores para computed values
 */
export const accountSelectors = {
  /**
   * Retorna contas ativas
   */
  getActiveAccounts: (state: AccountsState): Account[] =>
    state.accounts.filter((account) => account.is_active),

  /**
   * Retorna contas inativas
   */
  getInactiveAccounts: (state: AccountsState): Account[] =>
    state.accounts.filter((account) => !account.is_active),

  /**
   * Retorna saldo total das contas ativas
   */
  getTotalBalance: (state: AccountsState): number =>
    state.accounts
      .filter((account) => account.is_active)
      .reduce((total, account) => total + account.current_balance, 0),

  /**
   * Retorna conta por ID
   */
  getAccountById: (state: AccountsState, id: string): Account | undefined =>
    state.accounts.find((account) => account.id === id),

  /**
   * Retorna contas por tipo
   */
  getAccountsByType: (state: AccountsState, type: string): Account[] =>
    state.accounts.filter((account) => account.account_type === type && account.is_active),

  /**
   * Retorna quantidade de contas ativas
   */
  getActiveAccountsCount: (state: AccountsState): number =>
    state.accounts.filter((account) => account.is_active).length,

  /**
   * Verifica se atingiu limite de contas
   */
  hasReachedAccountLimit: (state: AccountsState): boolean =>
    state.accounts.filter((account) => account.is_active).length >= 20,
};
