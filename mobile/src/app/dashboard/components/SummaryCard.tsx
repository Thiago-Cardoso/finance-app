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
import type { FinancialSummary } from '@/shared/models/Dashboard.model';

interface SummaryCardProps {
  summary: FinancialSummary | null;
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

  const isPositiveBalance = summary.net_savings >= 0;

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
          {formatCurrency(summary.net_savings)}
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
            {formatCurrency(summary.total_income)}
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
            {formatCurrency(summary.total_expenses)}
          </Text>
        </View>
      </View>
    </View>
  );
}
