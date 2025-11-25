/**
 * View: TransactionList
 *
 * Lista de transações com paginação, filtros avançados, busca e pull-to-refresh.
 *
 * IMPORTANT: This component does NOT use useFilters hook to prevent infinite loops.
 * All filter state is managed through the transactions store only.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Plus, Wallet } from 'lucide-react-native';
import { Screen } from '@/shared/components/ui/Screen';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { FAB } from '@/shared/components/ui/FAB';
import { useTheme } from '@/shared/hooks/useTheme';
import { useTransactionViewModel } from '@/viewModels/useTransaction.viewModel';
import { useTransactionsStore } from '@/shared/stores/transactionsStore';
import { TransactionItem } from './components/TransactionItem';
import type { Transaction, TransactionType } from '@/shared/models/Transaction.model';

interface TransactionListViewProps {
  onNavigateToForm: (transaction?: Transaction) => void;
  onBack?: () => void;
}

export const TransactionListView = React.memo(function TransactionListView({
  onNavigateToForm,
  onBack,
}: TransactionListViewProps) {
  const { colors, theme } = useTheme();
  const {
    transactions,
    pagination,
    currentFilters,
    isLoading,
    isLoadingMore,
    error,
    loadTransactions,
    loadMore,
    deleteTransaction,
    resetFilters: resetStoreFilters,
    hasMorePages,
    clearErrors,
  } = useTransactionViewModel();

  const [refreshing, setRefreshing] = useState(false);

  // Load transactions on mount ONLY
  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount


  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const currentStoreFilters = useTransactionsStore.getState().currentFilters;
    await loadTransactions(currentStoreFilters, true);
    setRefreshing(false);
  }, [loadTransactions]);

  /**
   * Handle load more (pagination)
   */
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMorePages) {
      loadMore();
    }
  }, [isLoadingMore, hasMorePages, loadMore]);

  /**
   * Handle filter type change from tabs
   */
  const handleFilterTypeChange = useCallback(
    async (type: TransactionType | null) => {
      const currentStoreFilters = useTransactionsStore.getState().currentFilters;
      const newFilters = { ...currentStoreFilters, transaction_type: type || undefined };
      await loadTransactions(newFilters, true);
    },
    [loadTransactions]
  );


  /**
   * Handle delete transaction
   */
  const handleDeleteTransaction = useCallback(
    async (transaction: Transaction) => {
      Alert.alert(
        'Excluir Transação',
        `Tem certeza que deseja excluir "${transaction.description}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              const result = await deleteTransaction(transaction.id);
              if (!result.success) {
                Alert.alert('Erro', 'Não foi possível excluir a transação.');
              }
            },
          },
        ]
      );
    },
    [deleteTransaction]
  );

  /**
   * Render transaction item
   */
  const renderTransaction = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionItem
        transaction={item}
        onPress={() => onNavigateToForm(item)}
        onLongPress={() => handleDeleteTransaction(item)}
      />
    ),
    [onNavigateToForm, handleDeleteTransaction]
  );

  /**
   * Render footer (loading more)
   */
  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;

    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={theme.colors.primary.DEFAULT} />
      </View>
    );
  }, [isLoadingMore, theme.colors.primary.DEFAULT]);

  /**
   * Render empty state
   */
  const renderEmpty = useCallback(() => {
    if (isLoading) return null;

    // Empty state for no transactions
    return (
      <EmptyState
        icon={Wallet}
        title="Nenhuma transação"
        description="Comece adicionando sua primeira transação."
        action={{
          label: 'Adicionar Transação',
          onPress: () => onNavigateToForm(),
        }}
      />
    );
  }, [isLoading, onNavigateToForm]);

  /**
   * Render header
   */
  const renderHeader = useCallback(() => {
    const activeType = currentFilters?.transaction_type;

    return (
      <View className="mb-4">
        {/* Filter Tabs */}
        <View
          className="flex-row mb-3"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <FilterTab
            label="Todas"
            isActive={activeType === undefined}
            onPress={() => handleFilterTypeChange(null)}
            color={theme.colors.primary.DEFAULT}
          />
          <FilterTab
            label="Despesas"
            isActive={activeType === 'expense'}
            onPress={() => handleFilterTypeChange('expense')}
            color={theme.colors.error.DEFAULT}
          />
          <FilterTab
            label="Receitas"
            isActive={activeType === 'income'}
            onPress={() => handleFilterTypeChange('income')}
            color={theme.colors.success.DEFAULT}
          />
        </View>

        {/* Results Summary */}
        {pagination && (
          <Text
            className="text-sm"
            style={{ color: colors.text.secondary }}
          >
            {pagination.total_count} transações encontradas
          </Text>
        )}
      </View>
    );
  }, [
    currentFilters,
    handleFilterTypeChange,
    pagination,
    colors,
    theme.colors,
  ]);

  return (
    <Screen
      title="Transações"
      showHeader
      scrollable={false}
      showBackButton={!!onBack}
      onBack={onBack}
    >
      {/* Error State */}
      {error && (
        <TouchableOpacity
          onPress={clearErrors}
          className="mx-4 p-3 rounded-lg mb-4"
          style={{ backgroundColor: `${theme.colors.error.DEFAULT}20` }}
        >
          <Text className="text-center" style={{ color: theme.colors.error.DEFAULT }}>
            {error}
          </Text>
        </TouchableOpacity>
      )}

      {/* Loading State */}
      {isLoading && transactions.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.colors.primary.DEFAULT} />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary.DEFAULT}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingBottom: 100,
          }}
        />
      )}

      {/* FAB */}
      <FAB
        icon={Plus}
        onPress={() => onNavigateToForm()}
        position="bottom-right"
      />
    </Screen>
  );
});

/**
 * Filter Tab Component
 */
interface FilterTabProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  color: string;
}

function FilterTab({ label, isActive, onPress, color }: FilterTabProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 py-3 items-center"
      style={{
        borderBottomWidth: 2,
        borderBottomColor: isActive ? color : 'transparent',
      }}
    >
      <Text
        className="text-sm font-medium"
        style={{
          color: isActive ? color : colors.text.secondary,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default TransactionListView;
