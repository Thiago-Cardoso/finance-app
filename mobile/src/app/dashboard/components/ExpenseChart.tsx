/**
 * Component: ExpenseChart
 *
 * Gráfico de pizza das despesas por categoria.
 */

import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { VictoryPie } from 'victory-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency, formatPercent } from '@/shared/utils/formatters';
import type { CategoryBreakdown } from '@/shared/models/Dashboard.model';

const { width } = Dimensions.get('window');
const CHART_SIZE = width - 80;

interface ExpenseChartProps {
  expenses: CategoryBreakdown[];
  isLoading?: boolean;
}

/**
 * Cores para as categorias do gráfico
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

      <View className="items-center justify-center" style={{ height: CHART_SIZE }}>
        <View
          className="rounded-full"
          style={{
            width: CHART_SIZE * 0.7,
            height: CHART_SIZE * 0.7,
            backgroundColor: colors.border,
          }}
        />
      </View>
    </View>
  );
}

/**
 * Estado vazio do gráfico
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

      <View className="items-center justify-center py-12">
        <Text className="text-base" style={{ color: colors.text.secondary }}>
          Nenhuma despesa registrada
        </Text>
      </View>
    </View>
  );
}

/**
 * Gráfico de despesas por categoria
 */
export function ExpenseChart({ expenses, isLoading }: ExpenseChartProps) {
  const { colors } = useTheme();

  if (isLoading) {
    return <ExpenseChartSkeleton />;
  }

  if (!expenses || expenses.length === 0) {
    return <EmptyChart />;
  }

  // Prepara dados para o gráfico
  const chartData = expenses.map((expense, index) => ({
    x: expense.category_name,
    y: expense.total_amount,
    color: expense.category_color || CHART_COLORS[index % CHART_COLORS.length],
    percentage: expense.percentage,
  }));

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

      {/* Gráfico de Pizza */}
      <View className="items-center">
        <VictoryPie
          data={chartData}
          width={CHART_SIZE}
          height={CHART_SIZE}
          colorScale={chartData.map((d) => d.color)}
          innerRadius={CHART_SIZE * 0.15}
          padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={{
            labels: {
              fill: colors.text.primary,
              fontSize: 12,
              fontWeight: '600',
            },
          }}
          labels={({ datum }) => `${formatPercent(datum.percentage)}`}
        />
      </View>

      {/* Legendas */}
      <View className="mt-4">
        {expenses.map((expense, index) => (
          <View key={expense.category_id} className="flex-row items-center mb-3">
            <View
              className="w-4 h-4 rounded mr-3"
              style={{
                backgroundColor:
                  expense.category_color ||
                  CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
            <Text
              className="flex-1 text-sm"
              style={{ color: colors.text.primary }}
            >
              {expense.category_name}
            </Text>
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.text.primary }}
            >
              {formatCurrency(expense.total_amount)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
