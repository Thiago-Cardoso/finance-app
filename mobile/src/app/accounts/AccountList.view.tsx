/**
 * View: AccountList
 *
 * Lista de contas financeiras com saldo consolidado.
 */

import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Plus, Wallet } from 'lucide-react-native';
import { Screen } from '@/shared/components/ui/Screen';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { FAB } from '@/shared/components/ui/FAB';
import { useTheme } from '@/shared/hooks/useTheme';
import { useAccountViewModel } from '@/viewModels/useAccount.viewModel';
import { TotalBalanceCard } from './components/TotalBalanceCard';
import { AccountCard, AccountCardSkeleton } from './components/AccountCard';
import type { Account } from '@/shared/models/Account.model';

interface AccountListViewProps {
  onNavigateToForm: (account?: Account) => void;
  onBack?: () => void;
}

/**
 * Skeleton para carregamento
 */
function AccountListSkeleton() {
  return (
    <View>
      {[1, 2, 3].map((i) => (
        <AccountCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function AccountListView({ onNavigateToForm, onBack }: AccountListViewProps) {
  const { theme } = useTheme();
  const {
    activeAccounts,
    totalBalance,
    accountsCount,
    hasReachedLimit,
    isLoading,
    isRefreshing,
    error,
    loadAccounts,
    refreshAccounts,
    deactivateAccount,
    clearErrors,
  } = useAccountViewModel();

  useEffect(() => {
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = useCallback(async () => {
    await refreshAccounts();
  }, [refreshAccounts]);

  const handleDeactivateAccount = useCallback(
    async (account: Account) => {
      Alert.alert(
        'Desativar Conta',
        `Deseja desativar a conta "${account.name}"? Você poderá reativá-la depois.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desativar',
            style: 'destructive',
            onPress: async () => {
              const result = await deactivateAccount(account.id);
              if (!result.success) {
                Alert.alert('Erro', result.error || 'Erro ao desativar conta');
              }
            },
          },
        ]
      );
    },
    [deactivateAccount]
  );

  const handleAddAccount = useCallback(() => {
    if (hasReachedLimit) {
      Alert.alert(
        'Limite Atingido',
        'Você atingiu o limite de 20 contas ativas. Desative uma conta existente para criar uma nova.'
      );
      return;
    }
    onNavigateToForm();
  }, [hasReachedLimit, onNavigateToForm]);

  const renderAccountItem = useCallback(
    ({ item }: { item: Account }) => (
      <AccountCard
        account={item}
        onPress={() => onNavigateToForm(item)}
        onLongPress={() => handleDeactivateAccount(item)}
      />
    ),
    [onNavigateToForm, handleDeactivateAccount]
  );

  const renderHeader = useCallback(() => {
    if (activeAccounts.length === 0) return null;

    return (
      <TotalBalanceCard
        totalBalance={totalBalance}
        accountsCount={accountsCount}
      />
    );
  }, [activeAccounts.length, totalBalance, accountsCount]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;

    return (
      <EmptyState
        icon={Wallet}
        title="Nenhuma conta"
        description="Adicione suas contas bancárias, carteiras e cartões para controlar suas finanças."
        action={{
          label: 'Adicionar Conta',
          onPress: handleAddAccount,
        }}
      />
    );
  }, [isLoading, handleAddAccount]);

  return (
    <Screen
      title="Contas"
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
      {isLoading && activeAccounts.length === 0 ? (
        <View className="pt-4">
          <AccountListSkeleton />
        </View>
      ) : (
        <FlatList
          data={activeAccounts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAccountItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary.DEFAULT}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 100,
            paddingTop: 16,
          }}
        />
      )}

      {/* FAB */}
      <FAB
        icon={Plus}
        onPress={handleAddAccount}
        position="bottom-right"
      />
    </Screen>
  );
}

export default AccountListView;
