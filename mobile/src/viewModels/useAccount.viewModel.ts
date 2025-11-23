/**
 * Account ViewModel
 *
 * ViewModel para gerenciamento de contas financeiras.
 */

import { useCallback, useRef } from 'react';
import { useAccountsStore, accountSelectors } from '@/shared/stores/accountsStore';
import * as accountsService from '@/shared/services/api/accounts.service';
import type { Account, AccountFormData, AccountFilters } from '@/shared/models/Account.model';

interface UseAccountViewModel {
  // Data
  accounts: Account[];
  activeAccounts: Account[];
  selectedAccount: Account | null;
  totalBalance: number;
  accountsCount: number;
  hasReachedLimit: boolean;

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  loadAccounts: (filters?: AccountFilters, forceRefresh?: boolean) => Promise<void>;
  loadAccountById: (id: string) => Promise<Account | null>;
  createAccount: (data: AccountFormData) => Promise<{ success: boolean; account?: Account; error?: string }>;
  updateAccount: (id: string, data: Partial<AccountFormData>) => Promise<{ success: boolean; error?: string }>;
  deactivateAccount: (id: string) => Promise<{ success: boolean; error?: string }>;
  reactivateAccount: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshAccounts: () => Promise<void>;
  setSelectedAccount: (account: Account | null) => void;
  clearErrors: () => void;
}

export function useAccountViewModel(): UseAccountViewModel {
  // Get store state directly (stable references)
  const accounts = useAccountsStore((state) => state.accounts);
  const selectedAccount = useAccountsStore((state) => state.selectedAccount);
  const filters = useAccountsStore((state) => state.filters);
  const isLoading = useAccountsStore((state) => state.isLoading);
  const isRefreshing = useAccountsStore((state) => state.isRefreshing);
  const error = useAccountsStore((state) => state.error);

  // Get store actions directly (these are stable)
  const setAccounts = useAccountsStore((state) => state.setAccounts);
  const setSelectedAccount = useAccountsStore((state) => state.setSelectedAccount);
  const addAccount = useAccountsStore((state) => state.addAccount);
  const updateAccountInStore = useAccountsStore((state) => state.updateAccount);
  const removeAccount = useAccountsStore((state) => state.removeAccount);
  const setLoading = useAccountsStore((state) => state.setLoading);
  const setRefreshing = useAccountsStore((state) => state.setRefreshing);
  const setError = useAccountsStore((state) => state.setError);
  const isCacheValid = useAccountsStore((state) => state.isCacheValid);
  const invalidateCache = useAccountsStore((state) => state.invalidateCache);

  // Refs to track loading state (prevent double calls)
  const isLoadingRef = useRef(false);

  // Computed values using selectors
  const storeState = useAccountsStore.getState();
  const activeAccounts = accountSelectors.getActiveAccounts(storeState);
  const totalBalance = accountSelectors.getTotalBalance(storeState);
  const accountsCount = accountSelectors.getActiveAccountsCount(storeState);
  const hasReachedLimit = accountSelectors.hasReachedAccountLimit(storeState);

  /**
   * Carrega contas
   */
  const loadAccounts = useCallback(
    async (newFilters?: AccountFilters, forceRefresh = false) => {
      // Prevent concurrent calls
      if (isLoadingRef.current) return;

      // Verificar cache
      if (!forceRefresh && isCacheValid() && accounts.length > 0) {
        return;
      }

      try {
        isLoadingRef.current = true;
        setLoading(true);
        setError(null);

        const result = await accountsService.getAccounts(newFilters || filters);
        setAccounts(result);
      } catch (err: any) {
        // Se for 404, significa que a API ainda não existe - mostrar lista vazia
        if (err?.response?.status === 404) {
          setAccounts([]);
          console.log('Accounts API not available yet');
        } else {
          const errorMessage = err?.response?.data?.error || 'Erro ao carregar contas';
          setError(errorMessage);
          console.error('Error loading accounts:', err);
        }
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    },
    [accounts.length, filters, isCacheValid, setAccounts, setError, setLoading]
  );

  /**
   * Carrega conta por ID
   */
  const loadAccountById = useCallback(
    async (id: string): Promise<Account | null> => {
      try {
        setLoading(true);
        setError(null);

        const account = await accountsService.getAccountById(id);
        setSelectedAccount(account);
        return account;
      } catch (err: any) {
        if (err?.response?.status !== 404) {
          const errorMessage = err?.response?.data?.error || 'Erro ao carregar conta';
          setError(errorMessage);
          console.error('Error loading account:', err);
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setSelectedAccount]
  );

  /**
   * Cria nova conta
   */
  const createAccount = useCallback(
    async (data: AccountFormData): Promise<{ success: boolean; account?: Account; error?: string }> => {
      // Verificar limite de contas
      if (hasReachedLimit) {
        return { success: false, error: 'Limite de 20 contas atingido' };
      }

      try {
        setLoading(true);
        setError(null);

        const account = await accountsService.createAccount(data);
        addAccount(account);
        invalidateCache();

        return { success: true, account };
      } catch (err: any) {
        const errorMessage = err?.response?.data?.error || 'Erro ao criar conta';
        setError(errorMessage);
        console.error('Error creating account:', err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [addAccount, hasReachedLimit, invalidateCache, setError, setLoading]
  );

  /**
   * Atualiza conta
   */
  const updateAccount = useCallback(
    async (id: string, data: Partial<AccountFormData>): Promise<{ success: boolean; error?: string }> => {
      try {
        setLoading(true);
        setError(null);

        const account = await accountsService.updateAccount(id, data);
        updateAccountInStore(id, account);
        invalidateCache();

        return { success: true };
      } catch (err: any) {
        const errorMessage = err?.response?.data?.error || 'Erro ao atualizar conta';
        setError(errorMessage);
        console.error('Error updating account:', err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [invalidateCache, setError, setLoading, updateAccountInStore]
  );

  /**
   * Desativa conta (soft delete)
   */
  const deactivateAccount = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setLoading(true);
        setError(null);

        await accountsService.deactivateAccount(id);
        updateAccountInStore(id, { is_active: false });
        invalidateCache();

        return { success: true };
      } catch (err: any) {
        const errorMessage = err?.response?.data?.error || 'Erro ao desativar conta';
        setError(errorMessage);
        console.error('Error deactivating account:', err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [invalidateCache, setError, setLoading, updateAccountInStore]
  );

  /**
   * Reativa conta
   */
  const reactivateAccount = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setLoading(true);
        setError(null);

        await accountsService.reactivateAccount(id);
        updateAccountInStore(id, { is_active: true });
        invalidateCache();

        return { success: true };
      } catch (err: any) {
        const errorMessage = err?.response?.data?.error || 'Erro ao reativar conta';
        setError(errorMessage);
        console.error('Error reactivating account:', err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [invalidateCache, setError, setLoading, updateAccountInStore]
  );

  /**
   * Exclui conta permanentemente
   */
  const deleteAccount = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setLoading(true);
        setError(null);

        await accountsService.deleteAccount(id);
        removeAccount(id);
        invalidateCache();

        return { success: true };
      } catch (err: any) {
        const errorMessage = err?.response?.data?.error || 'Erro ao excluir conta';
        setError(errorMessage);
        console.error('Error deleting account:', err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [invalidateCache, removeAccount, setError, setLoading]
  );

  /**
   * Atualiza contas (pull-to-refresh)
   */
  const refreshAccounts = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      const result = await accountsService.getAccounts(filters);
      setAccounts(result);
    } catch (err: any) {
      // Se for 404, significa que a API ainda não existe
      if (err?.response?.status === 404) {
        setAccounts([]);
      } else {
        const errorMessage = err?.response?.data?.error || 'Erro ao atualizar contas';
        setError(errorMessage);
        console.error('Error refreshing accounts:', err);
      }
    } finally {
      setRefreshing(false);
    }
  }, [filters, setAccounts, setError, setRefreshing]);

  /**
   * Limpa erros
   */
  const clearErrors = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // Data
    accounts,
    activeAccounts,
    selectedAccount,
    totalBalance,
    accountsCount,
    hasReachedLimit,

    // UI State
    isLoading,
    isRefreshing,
    error,

    // Actions
    loadAccounts,
    loadAccountById,
    createAccount,
    updateAccount,
    deactivateAccount,
    reactivateAccount,
    deleteAccount,
    refreshAccounts,
    setSelectedAccount,
    clearErrors,
  };
}
