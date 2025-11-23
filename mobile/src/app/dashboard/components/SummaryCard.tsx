/**
 * Component: SummaryCard
 *
 * Card com resumo financeiro (saldo, receitas, despesas).
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ArrowUpCircle, ArrowDownCircle, DollarSign } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatters';
/**
 * Dashboard summary data structure from API
 * Supports both old format (current_month) and new FinancialSummary format
 */
interface DashboardSummary {
  // New FinancialSummary format
  summary?: {
    total_income: number;
    total_expenses: number;
    net_balance: number;
    transaction_count: number;
  };
  // Old format for backwards compatibility
  current_month?: {
    income: number;
    expenses: number;
    balance: number;
    transactions_count: number;
  };
  previous_month?: {
    income: number;
    expenses: number;
    balance: number;
  };
  variation?: {
    percentage: number;
    trend: 'up' | 'down' | 'stable';
    amount: number;
  };
}

interface SummaryCardProps {
  summary: DashboardSummary | null;
  isLoading?: boolean;
}

/**
 * Skeleton loader para o SummaryCard
 */
function SummaryCardSkeleton() {
  const { colors } = useTheme();

  return (
    <View
      className="mx-6 mt-4 p-6 rounded-2xl"
      style={{ backgroundColor: colors.card }}
    >
      {/* Saldo total skeleton */}
      <View className="mb-6">
        <View
          className="h-4 w-32 rounded mb-2"
          style={{ backgroundColor: colors.border }}
        />
        <View
          className="h-8 w-48 rounded"
          style={{ backgroundColor: colors.border }}
        />
      </View>

      {/* Receitas e despesas skeleton */}
      <View className="flex-row justify-between">
        <View className="flex-1 mr-2">
          <View
            className="h-4 w-20 rounded mb-2"
            style={{ backgroundColor: colors.border }}
          />
          <View
            className="h-6 w-28 rounded"
            style={{ backgroundColor: colors.border }}
          />
        </View>

        <View className="flex-1 ml-2">
          <View
            className="h-4 w-20 rounded mb-2"
            style={{ backgroundColor: colors.border }}
          />
          <View
            className="h-6 w-28 rounded"
            style={{ backgroundColor: colors.border }}
          />
        </View>
      </View>
    </View>
  );
}

/**
 * Card de resumo financeiro
 */
export function SummaryCard({ summary, isLoading }: SummaryCardProps) {
  const { colors, theme } = useTheme();

  if (isLoading || !summary) {
    return <SummaryCardSkeleton />;
  }

  // Extract values from API structure (supports both formats)
  const income = summary.summary?.total_income ?? summary.current_month?.income ?? 0;
  const expenses = summary.summary?.total_expenses ?? summary.current_month?.expenses ?? 0;
  const balance = summary.summary?.net_balance ?? summary.current_month?.balance ?? 0;
  const isPositiveBalance = balance >= 0;

  return (
    <View
      className="mx-6 mt-4 p-6 rounded-2xl"
      style={{ backgroundColor: colors.card }}
    >
      {/* Saldo Líquido (Net Savings) */}
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <DollarSign size={16} color={colors.text.secondary} />
          <Text
            className="text-sm ml-1"
            style={{ color: colors.text.secondary }}
          >
            Saldo do Período
          </Text>
        </View>
        <Text
          className="text-3xl font-bold"
          style={{
            color: isPositiveBalance
              ? theme.colors.success.DEFAULT
              : theme.colors.danger.DEFAULT,
          }}
        >
          {formatCurrency(balance)}
        </Text>
      </View>

      {/* Receitas e Despesas */}
      <View className="flex-row justify-between">
        {/* Receitas */}
        <View className="flex-1 mr-2">
          <View className="flex-row items-center mb-2">
            <ArrowUpCircle size={16} color={theme.colors.success.DEFAULT} />
            <Text
              className="text-sm ml-1"
              style={{ color: colors.text.secondary }}
            >
              Receitas
            </Text>
          </View>
          <Text
            className="text-lg font-semibold"
            style={{ color: theme.colors.success.DEFAULT }}
          >
            {formatCurrency(income)}
          </Text>
        </View>

        {/* Despesas */}
        <View className="flex-1 ml-2">
          <View className="flex-row items-center mb-2">
            <ArrowDownCircle size={16} color={theme.colors.danger.DEFAULT} />
            <Text
              className="text-sm ml-1"
              style={{ color: colors.text.secondary }}
            >
              Despesas
            </Text>
          </View>
          <Text
            className="text-lg font-semibold"
            style={{ color: theme.colors.danger.DEFAULT }}
          >
            {formatCurrency(expenses)}
          </Text>
        </View>
      </View>
    </View>
  );
}
