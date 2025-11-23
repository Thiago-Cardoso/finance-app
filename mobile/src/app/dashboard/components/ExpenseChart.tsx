/**
 * Component: ExpenseChart
 *
 * Lista de despesas por categoria (sem gráfico de pizza).
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency, formatPercent } from '@/shared/utils/formatters';

/**
 * Category expense data from API
 * Matches CategoryBreakdown from analytics types
 */
interface CategoryExpense {
  category_id?: number;
  category_name: string;
  category_color?: string;
  color?: string;
  icon?: string;
  amount: number;
  total?: number;
  percentage: number;
}

interface ExpenseChartProps {
  expenses: CategoryExpense[];
  isLoading?: boolean;
}

/**
 * Cores para as categorias
 */
const CHART_COLORS = [
  '#5843BE', // Primary
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFD93D', // Yellow
  '#95E1D3', // Mint
  '#F38181', // Pink
  '#AA96DA', // Purple
  '#FCBAD3', // Rose
];

/**
 * Skeleton loader para o ExpenseChart
 */
function ExpenseChartSkeleton() {
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
        Despesas por Categoria
      </Text>

      {[1, 2, 3].map((i) => (
        <View key={i} className="flex-row items-center mb-3">
          <View
            className="w-4 h-4 rounded mr-3"
            style={{ backgroundColor: colors.border }}
          />
          <View
            className="flex-1 h-4 rounded"
            style={{ backgroundColor: colors.border }}
          />
        </View>
      ))}
    </View>
  );
}

/**
 * Estado vazio
 */
function EmptyChart() {
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
        Despesas por Categoria
      </Text>

      <View className="items-center justify-center py-8">
        <Text className="text-base" style={{ color: colors.text.secondary }}>
          Nenhuma despesa registrada
        </Text>
      </View>
    </View>
  );
}

/**
 * Lista de despesas por categoria com barras de progresso
 */
export function ExpenseChart({ expenses, isLoading }: ExpenseChartProps) {
  const { colors } = useTheme();

  if (isLoading) {
    return <ExpenseChartSkeleton />;
  }

  if (!expenses || expenses.length === 0) {
    return <EmptyChart />;
  }

  // Calcular o total para percentuais
  const total = expenses.reduce((sum, exp) => sum + (exp.amount || exp.total || 0), 0);

  return (
    <View
      className="mx-6 mt-4 p-6 rounded-2xl"
      style={{ backgroundColor: colors.card }}
    >
      <Text
        className="text-lg font-semibold mb-4"
        style={{ color: colors.text.primary }}
      >
        Despesas por Categoria
      </Text>

      {/* Lista de categorias com barras de progresso */}
      <View>
        {expenses.map((expense, index) => {
          const color = expense.category_color || expense.color || CHART_COLORS[index % CHART_COLORS.length];
          const amount = expense.amount || expense.total || 0;
          const percentage = total > 0 ? (amount / total) * 100 : 0;
          const key = expense.category_id || `${expense.category_name}-${index}`;

          return (
            <View key={key} className="mb-4">
              {/* Header da categoria */}
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: color }}
                  />
                  <Text
                    className="text-sm font-medium"
                    style={{ color: colors.text.primary }}
                    numberOfLines={1}
                  >
                    {expense.category_name}
                  </Text>
                </View>
                <Text
                  className="text-sm font-semibold ml-2"
                  style={{ color: colors.text.primary }}
                >
                  {formatCurrency(amount)}
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
                    backgroundColor: color,
                    width: `${Math.min(percentage, 100)}%`,
                  }}
                />
              </View>

              {/* Percentual */}
              <Text
                className="text-xs mt-1"
                style={{ color: colors.text.secondary }}
              >
                {formatPercent(percentage)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Total */}
      <View
        className="flex-row justify-between pt-4 mt-2"
        style={{ borderTopWidth: 1, borderTopColor: colors.border }}
      >
        <Text
          className="text-base font-semibold"
          style={{ color: colors.text.primary }}
        >
          Total
        </Text>
        <Text
          className="text-base font-bold"
          style={{ color: colors.text.primary }}
        >
          {formatCurrency(total)}
        </Text>
      </View>
    </View>
  );
}
