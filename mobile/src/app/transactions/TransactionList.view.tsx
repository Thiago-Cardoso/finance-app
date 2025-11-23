/**
 * View: TransactionList
 *
 * Lista de transações com paginação, filtros e pull-to-refresh.
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
import { Plus, Filter, Search, Wallet } from 'lucide-react-native';
import { Screen } from '@/shared/components/ui/Screen';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { FAB } from '@/shared/components/ui/FAB';
import { useTheme } from '@/shared/hooks/useTheme';
import { useTransactionViewModel } from '@/viewModels/useTransaction.viewModel';
import { TransactionItem } from './components/TransactionItem';
import { FilterBar } from './components/FilterBar';
import type { Transaction, TransactionType } from '@/shared/models/Transaction.model';

interface TransactionListViewProps {
  onNavigateToForm: (transaction?: Transaction) => void;
  onBack?: () => void;
}

export function TransactionListView({
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
    filterByType,
    resetFilters,
    hasMorePages,
    clearErrors,
  } = useTransactionViewModel();

  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<TransactionType | null>(null);

  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTransactions(undefined, true);
    setRefreshing(false);
  }, [loadTransactions]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMorePages()) {
      loadMore();
    }
  }, [isLoadingMore, hasMorePages, loadMore]);

  const handleFilterChange = useCallback(
    async (type: TransactionType | null) => {
      setActiveFilter(type);
      if (type) {
        await filterByType(type);
      } else {
        await resetFilters();
      }
    },
    [filterByType, resetFilters]
  );

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

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;

    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={theme.colors.primary.DEFAULT} />
      </View>
    );
  }, [isLoadingMore, theme.colors.primary.DEFAULT]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;

    return (
      <EmptyState
        icon={Wallet}
        title="Nenhuma transação"
        description={
          activeFilter
            ? `Você não tem transações de ${activeFilter === 'income' ? 'receita' : activeFilter === 'expense' ? 'despesa' : 'transferência'}.`
            : 'Comece adicionando sua primeira transação.'
        }
        action={{
          label: 'Adicionar Transação',
          onPress: () => onNavigateToForm(),
        }}
      />
    );
  }, [isLoading, activeFilter, onNavigateToForm]);

  const renderHeader = useCallback(() => {
    return (
      <View className="mb-4">
        {/* Filter Tabs */}
        <View
          className="flex-row mb-4"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <FilterTab
            label="Todas"
            isActive={activeFilter === null}
            onPress={() => handleFilterChange(null)}
            color={theme.colors.primary.DEFAULT}
          />
          <FilterTab
            label="Despesas"
            isActive={activeFilter === 'expense'}
            onPress={() => handleFilterChange('expense')}
            color={theme.colors.error.DEFAULT}
          />
          <FilterTab
            label="Receitas"
            isActive={activeFilter === 'income'}
            onPress={() => handleFilterChange('income')}
            color={theme.colors.success.DEFAULT}
          />
        </View>

        {/* Summary */}
        {pagination && (
          <Text
            className="text-sm mb-2"
            style={{ color: colors.text.secondary }}
          >
            {pagination.total_count} transações encontradas
          </Text>
        )}
      </View>
    );
  }, [
    activeFilter,
    handleFilterChange,
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
      headerRight={
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Filter
            size={24}
            color={
              showFilters
                ? theme.colors.primary.DEFAULT
                : colors.text.secondary
            }
          />
        </TouchableOpacity>
      }
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
}

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
