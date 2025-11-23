/**
 * Component: BalanceEvolution
 *
 * Line chart showing balance evolution over time.
 */

import React, { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { LineChart, LineChartSkeleton, type LineChartDataPoint } from '@/shared/components/charts';
import { Card } from '@/shared/components/ui/Card';
import { formatCurrency, formatPercent } from '@/shared/utils/formatters';

export interface BalanceEvolutionProps {
  /**
   * Chart data points
   */
  data: LineChartDataPoint[];

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Title for the section
   */
  title?: string;
}

/**
 * Calculate growth rate
 */
function calculateGrowth(data: LineChartDataPoint[]): {
  rate: number;
  startValue: number;
  endValue: number;
  direction: 'up' | 'down' | 'flat';
} {
  if (data.length < 2) {
    return { rate: 0, startValue: 0, endValue: 0, direction: 'flat' };
  }

  const startValue = data[0].value;
  const endValue = data[data.length - 1].value;
  const change = endValue - startValue;

  let rate = 0;
  if (startValue !== 0) {
    rate = (change / Math.abs(startValue)) * 100;
  } else if (endValue > 0) {
    rate = 100;
  }

  const direction: 'up' | 'down' | 'flat' =
    Math.abs(rate) < 1 ? 'flat' : rate > 0 ? 'up' : 'down';

  return { rate, startValue, endValue, direction };
}

/**
 * Trend Summary component
 */
function TrendSummary({
  growth,
}: {
  growth: ReturnType<typeof calculateGrowth>;
}) {
  const { colors, theme } = useTheme();

  const iconColor =
    growth.direction === 'flat'
      ? colors.text.secondary
      : growth.direction === 'up'
        ? theme.colors.success.DEFAULT
        : theme.colors.error.DEFAULT;

  const Icon =
    growth.direction === 'flat'
      ? Minus
      : growth.direction === 'up'
        ? TrendingUp
        : TrendingDown;

  return (
    <View className="flex-row items-center mb-4">
      <View
        className="flex-row items-center px-3 py-2 rounded-full"
        style={{
          backgroundColor:
            growth.direction === 'flat'
              ? colors.surface
              : growth.direction === 'up'
                ? theme.colors.success[100]
                : theme.colors.error[100],
        }}
      >
        <Icon size={16} color={iconColor} />
        <Text
          className="text-sm font-medium ml-1"
          style={{ color: iconColor }}
        >
          {growth.direction === 'flat'
            ? 'Estável'
            : growth.direction === 'up'
              ? `+${formatPercent(Math.abs(growth.rate))}`
              : `-${formatPercent(Math.abs(growth.rate))}`}
        </Text>
      </View>
      <Text
        className="text-sm ml-3"
        style={{ color: colors.text.secondary }}
      >
        no período
      </Text>
    </View>
  );
}

/**
 * Stats row component
 */
function StatsRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center justify-between py-2">
      <Text
        className="text-sm"
        style={{ color: colors.text.secondary }}
      >
        {label}
      </Text>
      <Text
        className="text-sm font-semibold"
        style={{ color: color || colors.text.primary }}
      >
        {formatCurrency(value)}
      </Text>
    </View>
  );
}

function BalanceEvolutionComponent({
  data,
  isLoading = false,
  title = 'Evolução do Saldo',
}: BalanceEvolutionProps) {
  const { colors, theme } = useTheme();

  /**
   * Calculate statistics
   */
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const growth = calculateGrowth(data);

    return {
      min,
      max,
      growth,
    };
  }, [data]);

  if (isLoading) {
    return (
      <Card className="p-4 mb-4">
        <View className="mb-4">
          <View
            className="w-36 h-5 rounded mb-2"
            style={{ backgroundColor: colors.border }}
          />
          <View
            className="w-24 h-4 rounded"
            style={{ backgroundColor: colors.border }}
          />
        </View>
        <LineChartSkeleton />
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
          {title}
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
        {title}
      </Text>
      <Text
        className="text-sm mb-3"
        style={{ color: colors.text.secondary }}
      >
        Acompanhe a evolução do seu saldo ao longo do tempo
      </Text>

      {/* Trend Summary */}
      {stats && <TrendSummary growth={stats.growth} />}

      {/* Chart */}
      <LineChart
        data={data}
        height={180}
        showValues={false}
        color={theme.colors.primary.DEFAULT}
      />

      {/* Stats */}
      {stats && (
        <View
          className="mt-4 pt-4"
          style={{ borderTopWidth: 1, borderTopColor: colors.border }}
        >
          <StatsRow
            label="Saldo Inicial"
            value={stats.growth.startValue}
          />
          <StatsRow
            label="Saldo Final"
            value={stats.growth.endValue}
            color={
              stats.growth.endValue >= 0
                ? theme.colors.success.DEFAULT
                : theme.colors.error.DEFAULT
            }
          />
          <View
            className="my-2"
            style={{ borderTopWidth: 1, borderTopColor: colors.border }}
          />
          <StatsRow
            label="Mínimo no Período"
            value={stats.min}
            color={theme.colors.error.DEFAULT}
          />
          <StatsRow
            label="Máximo no Período"
            value={stats.max}
            color={theme.colors.success.DEFAULT}
          />
        </View>
      )}
    </Card>
  );
}

export const BalanceEvolution = memo(BalanceEvolutionComponent);
export default BalanceEvolution;
