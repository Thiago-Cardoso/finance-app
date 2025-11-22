/**
 * Component: RecentTransactionsList
 *
 * Lista das últimas transações com link para ver todas.
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowUpCircle, ArrowDownCircle, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency, formatShortDate } from '@/shared/utils/formatters';
import type { RecentTransaction } from '@/shared/models/Dashboard.model';

interface RecentTransactionsListProps {
  transactions: RecentTransaction[];
  isLoading?: boolean;
}

/**
 * Skeleton loader para RecentTransactionsList
 */
function RecentTransactionsListSkeleton() {
  const { colors } = useTheme();

  return (
    <View
      className="mx-6 mt-4 mb-6 p-6 rounded-2xl"
      style={{ backgroundColor: colors.card }}
    >
      <View
        className="h-5 w-40 rounded mb-4"
        style={{ backgroundColor: colors.border }}
      />

      {[1, 2, 3].map((i) => (
        <View key={i} className="flex-row items-center py-3 border-b border-border">
          <View
            className="w-10 h-10 rounded-full mr-3"
            style={{ backgroundColor: colors.border }}
          />
          <View className="flex-1">
            <View
              className="h-4 w-32 rounded mb-2"
              style={{ backgroundColor: colors.border }}
            />
            <View
              className="h-3 w-20 rounded"
              style={{ backgroundColor: colors.border }}
            />
          </View>
          <View
            className="h-4 w-20 rounded"
            style={{ backgroundColor: colors.border }}
          />
        </View>
      ))}
    </View>
  );
}

/**
 * Estado vazio de transações
 */
function EmptyTransactions() {
  const { colors } = useTheme();

  return (
    <View
      className="mx-6 mt-4 mb-6 p-6 rounded-2xl"
      style={{ backgroundColor: colors.card }}
    >
      <Text
        className="text-lg font-semibold mb-4"
        style={{ color: colors.text.primary }}
      >
        Transações Recentes
      </Text>

      <View className="items-center py-8">
        <Text className="text-base" style={{ color: colors.text.secondary }}>
          Nenhuma transação registrada
        </Text>
      </View>
    </View>
  );
}

/**
 * Item individual de transação
 */
function TransactionItem({ transaction }: { transaction: RecentTransaction }) {
  const { colors, theme } = useTheme();
  const navigation = useNavigation();

  const isIncome = transaction.transaction_type === 'income';
  const Icon = isIncome ? ArrowUpCircle : ArrowDownCircle;
  const iconColor = isIncome
    ? theme.colors.success.DEFAULT
    : theme.colors.danger.DEFAULT;

  const handlePress = () => {
    // Navega para detalhes da transação
    // navigation.navigate('TransactionDetails', { transactionId: transaction.id });
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center py-3"
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
    >
      {/* Ícone da categoria */}
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Icon size={20} color={iconColor} />
      </View>

      {/* Descrição e data */}
      <View className="flex-1">
        <Text
          className="text-sm font-medium mb-1"
          style={{ color: colors.text.primary }}
          numberOfLines={1}
        >
          {transaction.description || transaction.category_name}
        </Text>
        <Text className="text-xs" style={{ color: colors.text.secondary }}>
          {formatShortDate(transaction.date)} • {transaction.account_name}
        </Text>
      </View>

      {/* Valor */}
      <Text
        className="text-sm font-semibold ml-2"
        style={{
          color: isIncome
            ? theme.colors.success.DEFAULT
            : theme.colors.danger.DEFAULT,
        }}
      >
        {isIncome ? '+' : '-'}
        {formatCurrency(Math.abs(transaction.amount))}
      </Text>
    </Pressable>
  );
}

/**
 * Lista de transações recentes
 */
export function RecentTransactionsList({
  transactions,
  isLoading,
}: RecentTransactionsListProps) {
  const { colors, theme } = useTheme();
  const navigation = useNavigation();

  if (isLoading) {
    return <RecentTransactionsListSkeleton />;
  }

  if (!transactions || transactions.length === 0) {
    return <EmptyTransactions />;
  }

  const handleViewAll = () => {
    // Navega para lista completa de transações
    // navigation.navigate('Transactions');
  };

  return (
    <View
      className="mx-6 mt-4 mb-6 p-6 rounded-2xl"
      style={{ backgroundColor: colors.card }}
    >
      {/* Header com botão "Ver todas" */}
      <View className="flex-row items-center justify-between mb-4">
        <Text
          className="text-lg font-semibold"
          style={{ color: colors.text.primary }}
        >
          Transações Recentes
        </Text>

        <Pressable
          onPress={handleViewAll}
          className="flex-row items-center"
        >
          <Text
            className="text-sm mr-1"
            style={{ color: theme.colors.primary.DEFAULT }}
          >
            Ver todas
          </Text>
          <ChevronRight
            size={16}
            color={theme.colors.primary.DEFAULT}
          />
        </Pressable>
      </View>

      {/* Lista de transações */}
      {transactions.map((transaction) => (
        <TransactionItem key={transaction.id} transaction={transaction} />
      ))}
    </View>
  );
}
