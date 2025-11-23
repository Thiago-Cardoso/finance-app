/**
 * Component: MonthlyChart
 *
 * Bar chart showing income vs expenses comparison with month-over-month change.
 */

import React, { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { BarChart, BarChartSkeleton, type BarChartDataItem } from '@/shared/components/charts';
import { Card } from '@/shared/components/ui/Card';
import { formatCurrency, formatPercent } from '@/shared/utils/formatters';

export interface MonthlyChartProps {
  /**
   * Chart data
   */
  data: BarChartDataItem[];

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Current month totals for comparison header
   */
  currentMonth?: {
    income: number;
    expense: number;
    net: number;
  };

  /**
   * Previous month totals for variance calculation
   */
  previousMonth?: {
    income: number;
    expense: number;
    net: number;
  };
}

/**
 * Calculate percentage change
 */
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Trend indicator component
 */
function TrendIndicator({
  value,
  inverted = false,
}: {
  value: number;
  inverted?: boolean;
}) {
  const { theme } = useTheme();

  const isPositive = inverted ? value < 0 : value > 0;
  const isNeutral = Math.abs(value) < 1;

  const { colors } = useTheme();

  const color = isNeutral
    ? colors.text.secondary
    : isPositive
      ? theme.colors.success.DEFAULT
      : theme.colors.error.DEFAULT;

  const Icon = isNeutral
    ? Minus
    : isPositive
      ? TrendingUp
      : TrendingDown;

  return (
    <View className="flex-row items-center">
      <Icon size={14} color={color} />
      <Text
        className="text-xs ml-1"
        style={{ color }}
      >
        {formatPercent(Math.abs(value))}
      </Text>
    </View>
  );
}

function MonthlyChartComponent({
  data,
  isLoading = false,
  currentMonth,
  previousMonth,
}: MonthlyChartProps) {
  const { colors, theme } = useTheme();

  /**
   * Calculate variances
   */
  const variances = useMemo(() => {
    if (!currentMonth || !previousMonth) return null;

    return {
      income: calculateChange(currentMonth.income, previousMonth.income),
      expense: calculateChange(currentMonth.expense, previousMonth.expense),
      net: calculateChange(currentMonth.net, previousMonth.net),
    };
  }, [currentMonth, previousMonth]);

  if (isLoading) {
    return (
      <Card className="p-4 mb-4">
        <View className="mb-4">
          <View
            className="w-32 h-5 rounded mb-2"
            style={{ backgroundColor: colors.border }}
          />
          <View
            className="w-48 h-4 rounded"
            style={{ backgroundColor: colors.border }}
          />
        </View>
        <BarChartSkeleton />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-4 mb-4">
        <Text
          className="text-lg font-semibold mb-2"
          style={{ color: colors.text.primary }}
        >
          Receitas vs Despesas
        </Text>
        <View className="items-center justify-center py-8">
          <Text
            className="text-base"
            style={{ color: colors.text.secondary }}
          >
            Sem dados para o período selecionado
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-4">
      {/* Header */}
      <Text
        className="text-lg font-semibold mb-1"
        style={{ color: colors.text.primary }}
      >
        Receitas vs Despesas
      </Text>
      <Text
        className="text-sm mb-4"
        style={{ color: colors.text.secondary }}
      >
        Comparativo mensal de entradas e saídas
      </Text>

      {/* Summary Cards */}
      {currentMonth && (
        <View className="flex-row mb-4">
          {/* Income */}
          <View
            className="flex-1 p-3 rounded-lg mr-2"
            style={{ backgroundColor: theme.colors.success[100] }}
          >
            <Text
              className="text-xs mb-1"
              style={{ color: theme.colors.success.DEFAULT }}
            >
              Receitas
            </Text>
            <Text
              className="text-base font-bold"
              style={{ color: theme.colors.success.DEFAULT }}
              numberOfLines={1}
            >
              {formatCurrency(currentMonth.income)}
            </Text>
            {variances && (
              <TrendIndicator value={variances.income} />
            )}
          </View>

          {/* Expense */}
          <View
            className="flex-1 p-3 rounded-lg ml-2"
            style={{ backgroundColor: theme.colors.error[100] }}
          >
            <Text
              className="text-xs mb-1"
              style={{ color: theme.colors.error.DEFAULT }}
            >
              Despesas
            </Text>
            <Text
              className="text-base font-bold"
              style={{ color: theme.colors.error.DEFAULT }}
              numberOfLines={1}
            >
              {formatCurrency(currentMonth.expense)}
            </Text>
            {variances && (
              <TrendIndicator value={variances.expense} inverted />
            )}
          </View>
        </View>
      )}

      {/* Net Balance */}
      {currentMonth && (
        <View
          className="p-3 rounded-lg mb-4"
          style={{
            backgroundColor:
              currentMonth.net >= 0
                ? theme.colors.success[100]
                : theme.colors.error[100],
          }}
        >
          <View className="flex-row items-center justify-between">
            <Text
              className="text-sm"
              style={{ color: colors.text.secondary }}
            >
              Saldo Líquido
            </Text>
            <View className="flex-row items-center">
              <Text
                className="text-lg font-bold mr-2"
                style={{
                  color:
                    currentMonth.net >= 0
                      ? theme.colors.success.DEFAULT
                      : theme.colors.error.DEFAULT,
                }}
              >
                {formatCurrency(currentMonth.net)}
              </Text>
              {variances && (
                <TrendIndicator value={variances.net} />
              )}
            </View>
          </View>
        </View>
      )}

      {/* Chart */}
      <BarChart
        data={data}
        showValues={false}
        height={200}
      />
    </Card>
  );
}

export const MonthlyChart = memo(MonthlyChartComponent);
export default MonthlyChart;
