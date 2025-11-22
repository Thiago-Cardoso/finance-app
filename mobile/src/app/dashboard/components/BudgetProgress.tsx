/**
 * Component: BudgetProgress
 *
 * Barra de progresso do orçamento com cores indicativas.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency, formatPercent } from '@/shared/utils/formatters';
import type { BudgetDetail } from '@/shared/models/Dashboard.model';

interface BudgetProgressProps {
  budgets: BudgetDetail[];
  isLoading?: boolean;
}

/**
 * Skeleton loader para BudgetProgress
 */
function BudgetProgressSkeleton() {
  const { colors } = useTheme();

  return (
    <View
      className="mx-6 mt-4 p-6 rounded-2xl"
      style={{ backgroundColor: colors.card }}
    >
      <View
        className="h-5 w-32 rounded mb-4"
        style={{ backgroundColor: colors.border }}
      />

      {[1, 2].map((i) => (
        <View key={i} className="mb-4">
          <View className="flex-row justify-between mb-2">
            <View
              className="h-4 w-24 rounded"
              style={{ backgroundColor: colors.border }}
            />
            <View
              className="h-4 w-20 rounded"
              style={{ backgroundColor: colors.border }}
            />
          </View>
          <View
            className="h-2 rounded-full"
            style={{ backgroundColor: colors.border }}
          />
        </View>
      ))}
    </View>
  );
}

/**
 * Estado vazio de orçamentos
 */
function EmptyBudgets() {
  const { colors } = useTheme();

  return (
    <View
      className="mx-6 mt-4 p-6 rounded-2xl"
      style={{ backgroundColor: colors.card }}
    >
      <Text
        className="text-lg font-semibold mb-4"
        style={{ color: colors.text.primary }}
      >
        Orçamentos
      </Text>

      <View className="items-center py-8">
        <Text className="text-base" style={{ color: colors.text.secondary }}>
          Nenhum orçamento configurado
        </Text>
      </View>
    </View>
  );
}

/**
 * Item individual de progresso de orçamento
 */
function BudgetItem({ budget }: { budget: BudgetDetail }) {
  const { colors, theme } = useTheme();

  // Define cor baseada no status
  const getStatusColor = () => {
    switch (budget.status) {
      case 'safe':
        return theme.colors.success.DEFAULT;
      case 'warning':
        return theme.colors.warning.DEFAULT;
      case 'exceeded':
        return theme.colors.danger.DEFAULT;
      default:
        return theme.colors.primary.DEFAULT;
    }
  };

  const statusColor = getStatusColor();
  const percentage = Math.min(budget.percentage_used, 100); // Cap at 100%

  return (
    <View className="mb-4">
      {/* Header com categoria e valores */}
      <View className="flex-row justify-between mb-2">
        <Text className="text-sm font-medium" style={{ color: colors.text.primary }}>
          {budget.category_name}
        </Text>
        <Text className="text-sm" style={{ color: colors.text.secondary }}>
          {formatCurrency(budget.spent_amount)} / {formatCurrency(budget.budget_amount)}
        </Text>
      </View>

      {/* Barra de progresso */}
      <View
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: colors.border }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: statusColor,
          }}
        />
      </View>

      {/* Percentual */}
      <Text
        className="text-xs mt-1"
        style={{ color: statusColor }}
      >
        {formatPercent(budget.percentage_used)}
        {budget.percentage_used > 100 && ' acima do limite'}
      </Text>
    </View>
  );
}

/**
 * Lista de progresso de orçamentos
 */
export function BudgetProgress({ budgets, isLoading }: BudgetProgressProps) {
  const { colors } = useTheme();

  if (isLoading) {
    return <BudgetProgressSkeleton />;
  }

  if (!budgets || budgets.length === 0) {
    return <EmptyBudgets />;
  }

  return (
    <View
      className="mx-6 mt-4 p-6 rounded-2xl"
      style={{ backgroundColor: colors.card }}
    >
      <Text
        className="text-lg font-semibold mb-4"
        style={{ color: colors.text.primary }}
      >
        Orçamentos
      </Text>

      {budgets.map((budget) => (
        <BudgetItem key={budget.budget_id} budget={budget} />
      ))}
    </View>
  );
}
