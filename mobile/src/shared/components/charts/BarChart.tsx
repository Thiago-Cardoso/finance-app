/**
 * Component: BarChart
 *
 * Gráfico de barras comparativo (receitas vs despesas).
 * Alternativa leve ao Victory Native para evitar problemas de compatibilidade.
 */

import React, { memo, useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface BarChartDataItem {
  label: string;
  income: number;
  expense: number;
}

export interface BarChartProps {
  data: BarChartDataItem[];
  width?: number;
  height?: number;
  title?: string;
  showLegend?: boolean;
  showValues?: boolean;
  incomeColor?: string;
  expenseColor?: string;
  formatValue?: (value: number) => string;
  isLoading?: boolean;
}

/**
 * Skeleton loader for BarChart
 */
function BarChartSkeleton({
  width = SCREEN_WIDTH - 48,
  height = 250,
}: {
  width?: number;
  height?: number;
}) {
  const { colors } = useTheme();

  return (
    <View style={{ width }}>
      {/* Legend skeleton */}
      <View className="flex-row justify-center mb-4">
        <View
          className="w-20 h-4 rounded mr-4"
          style={{ backgroundColor: colors.border }}
        />
        <View
          className="w-20 h-4 rounded"
          style={{ backgroundColor: colors.border }}
        />
      </View>

      {/* Chart skeleton */}
      <View
        className="rounded-lg"
        style={{ height: height - 80, backgroundColor: colors.border }}
      />

      {/* Labels skeleton */}
      <View className="flex-row justify-between mt-2">
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            className="h-3 w-12 rounded"
            style={{ backgroundColor: colors.border }}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * Legend component
 */
function ChartLegend({
  incomeColor,
  expenseColor,
}: {
  incomeColor: string;
  expenseColor: string;
}) {
  const { colors } = useTheme();

  return (
    <View className="flex-row justify-center mb-4">
      <View className="flex-row items-center mr-6">
        <View
          className="w-3 h-3 rounded-full mr-2"
          style={{ backgroundColor: incomeColor }}
        />
        <Text className="text-sm" style={{ color: colors.text.primary }}>
          Receitas
        </Text>
      </View>
      <View className="flex-row items-center">
        <View
          className="w-3 h-3 rounded-full mr-2"
          style={{ backgroundColor: expenseColor }}
        />
        <Text className="text-sm" style={{ color: colors.text.primary }}>
          Despesas
        </Text>
      </View>
    </View>
  );
}

/**
 * BarChart component - Compares income vs expenses
 */
function BarChartComponent({
  data,
  width = SCREEN_WIDTH - 48,
  height = 250,
  title,
  showLegend = true,
  showValues = true,
  incomeColor,
  expenseColor,
  formatValue = formatCurrency,
  isLoading = false,
}: BarChartProps) {
  const { colors, theme } = useTheme();
  const chartIncomeColor = incomeColor || theme.colors.success.DEFAULT;
  const chartExpenseColor = expenseColor || theme.colors.error.DEFAULT;

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const allValues = data.flatMap((d) => [d.income, d.expense]);
    const maxValue = Math.max(...allValues);

    const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
    const totalExpense = data.reduce((sum, d) => sum + d.expense, 0);
    const balance = totalIncome - totalExpense;

    return {
      items: data.map((item) => ({
        ...item,
        incomeHeight: maxValue > 0 ? (item.income / maxValue) * 100 : 0,
        expenseHeight: maxValue > 0 ? (item.expense / maxValue) * 100 : 0,
      })),
      maxValue,
      totalIncome,
      totalExpense,
      balance,
    };
  }, [data]);

  if (isLoading) {
    return <BarChartSkeleton width={width} height={height} />;
  }

  if (!chartData) {
    return (
      <View
        style={{ width, height }}
        className="items-center justify-center"
      >
        <Text className="text-base" style={{ color: colors.text.secondary }}>
          Sem dados disponíveis
        </Text>
      </View>
    );
  }

  const chartHeight = height - (showLegend ? 100 : 60) - (showValues ? 30 : 0);
  const groupWidth = (width - 32) / chartData.items.length;
  const barWidth = Math.min((groupWidth - 16) / 2, 24);

  return (
    <View style={{ width }}>
      {title && (
        <Text
          className="text-lg font-semibold mb-4"
          style={{ color: colors.text.primary }}
        >
          {title}
        </Text>
      )}

      {/* Legend */}
      {showLegend && (
        <ChartLegend
          incomeColor={chartIncomeColor}
          expenseColor={chartExpenseColor}
        />
      )}

      {/* Chart Container */}
      <View
        className="flex-row items-end justify-around px-4"
        style={{
          height: chartHeight,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {chartData.items.map((item, index) => {
          const incomeBarHeight = Math.max(
            (item.incomeHeight / 100) * (chartHeight - 10),
            item.income > 0 ? 4 : 0
          );
          const expenseBarHeight = Math.max(
            (item.expenseHeight / 100) * (chartHeight - 10),
            item.expense > 0 ? 4 : 0
          );

          return (
            <View
              key={`${item.label}-${index}`}
              className="items-center"
              style={{ width: groupWidth }}
            >
              {/* Bars container */}
              <View className="flex-row items-end">
                {/* Income bar */}
                <View className="items-center mx-1">
                  {showValues && item.income > 0 && (
                    <Text
                      className="text-xs mb-1"
                      style={{ color: chartIncomeColor }}
                      numberOfLines={1}
                    >
                      {formatValue(item.income)}
                    </Text>
                  )}
                  <View
                    className="rounded-t"
                    style={{
                      width: barWidth,
                      height: incomeBarHeight,
                      backgroundColor: chartIncomeColor,
                    }}
                  />
                </View>

                {/* Expense bar */}
                <View className="items-center mx-1">
                  {showValues && item.expense > 0 && (
                    <Text
                      className="text-xs mb-1"
                      style={{ color: chartExpenseColor }}
                      numberOfLines={1}
                    >
                      {formatValue(item.expense)}
                    </Text>
                  )}
                  <View
                    className="rounded-t"
                    style={{
                      width: barWidth,
                      height: expenseBarHeight,
                      backgroundColor: chartExpenseColor,
                    }}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* X-axis labels */}
      <View className="flex-row justify-around px-4 mt-2">
        {chartData.items.map((item, index) => (
          <View
            key={`label-${index}`}
            className="items-center"
            style={{ width: groupWidth }}
          >
            <Text
              className="text-xs"
              style={{ color: colors.text.secondary }}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View
        className="flex-row justify-between mt-4 pt-3"
        style={{ borderTopWidth: 1, borderTopColor: colors.border }}
      >
        <View className="items-center flex-1">
          <Text className="text-xs" style={{ color: colors.text.secondary }}>
            Total Receitas
          </Text>
          <Text
            className="text-sm font-semibold"
            style={{ color: chartIncomeColor }}
          >
            {formatValue(chartData.totalIncome)}
          </Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-xs" style={{ color: colors.text.secondary }}>
            Saldo
          </Text>
          <Text
            className="text-sm font-semibold"
            style={{
              color:
                chartData.balance >= 0
                  ? chartIncomeColor
                  : chartExpenseColor,
            }}
          >
            {formatValue(chartData.balance)}
          </Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-xs" style={{ color: colors.text.secondary }}>
            Total Despesas
          </Text>
          <Text
            className="text-sm font-semibold"
            style={{ color: chartExpenseColor }}
          >
            {formatValue(chartData.totalExpense)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export const BarChart = memo(BarChartComponent);
