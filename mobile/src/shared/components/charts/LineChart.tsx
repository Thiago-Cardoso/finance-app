/**
 * Component: LineChart
 *
 * Gráfico de linha usando componentes React Native puros.
 * Alternativa leve ao Victory Native para evitar problemas de compatibilidade.
 */

import React, { memo, useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface LineChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

export interface LineChartProps {
  data: LineChartDataPoint[];
  width?: number;
  height?: number;
  title?: string;
  color?: string;
  showValues?: boolean;
  showLabels?: boolean;
  formatValue?: (value: number) => string;
  isLoading?: boolean;
}

/**
 * Skeleton loader for LineChart
 */
function LineChartSkeleton({
  width = SCREEN_WIDTH - 48,
  height = 200,
}: {
  width?: number;
  height?: number;
}) {
  const { colors } = useTheme();

  return (
    <View style={{ width, height }}>
      {/* Chart area skeleton */}
      <View
        className="flex-1 rounded-lg mb-2"
        style={{ backgroundColor: colors.border }}
      />
      {/* Labels skeleton */}
      <View className="flex-row justify-between">
        {[1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            className="h-3 w-8 rounded"
            style={{ backgroundColor: colors.border }}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * LineChart component using View-based visualization
 * Displays data as a series of connected bars with trend indication
 */
function LineChartComponent({
  data,
  width = SCREEN_WIDTH - 48,
  height = 200,
  title,
  color,
  showValues = true,
  showLabels = true,
  formatValue = formatCurrency,
  isLoading = false,
}: LineChartProps) {
  const { colors, theme } = useTheme();
  const chartColor = color || theme.colors.primary.DEFAULT;

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const values = data.map((d) => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    return {
      points: data.map((point, index) => ({
        ...point,
        normalizedValue: ((point.value - minValue) / range) * 100,
        isMax: point.value === maxValue,
        isMin: point.value === minValue,
        trend:
          index > 0
            ? point.value > data[index - 1].value
              ? 'up'
              : point.value < data[index - 1].value
                ? 'down'
                : 'flat'
            : 'flat',
      })),
      maxValue,
      minValue,
      average: values.reduce((a, b) => a + b, 0) / values.length,
    };
  }, [data]);

  if (isLoading) {
    return <LineChartSkeleton width={width} height={height} />;
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

  const barWidth = (width - 32) / chartData.points.length - 8;
  const chartHeight = height - (showLabels ? 40 : 20) - (showValues ? 20 : 0);

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

      {/* Chart Container */}
      <View
        className="flex-row items-end justify-between px-4"
        style={{ height: chartHeight }}
      >
        {chartData.points.map((point, index) => {
          const barHeight = Math.max(
            (point.normalizedValue / 100) * (chartHeight - 20),
            4
          );

          return (
            <View
              key={`${point.label}-${index}`}
              className="items-center"
              style={{ width: barWidth }}
            >
              {/* Value label */}
              {showValues && (
                <Text
                  className="text-xs mb-1"
                  style={{
                    color: point.isMax
                      ? theme.colors.success.DEFAULT
                      : point.isMin
                        ? theme.colors.error.DEFAULT
                        : colors.text.secondary,
                    fontWeight: point.isMax || point.isMin ? '600' : '400',
                  }}
                  numberOfLines={1}
                >
                  {formatValue(point.value)}
                </Text>
              )}

              {/* Bar */}
              <View
                className="rounded-t-lg"
                style={{
                  width: Math.max(barWidth - 4, 8),
                  height: barHeight,
                  backgroundColor: chartColor,
                  opacity: point.isMax ? 1 : point.isMin ? 0.6 : 0.8,
                }}
              />

              {/* Trend indicator */}
              {index > 0 && (
                <View
                  className="absolute -left-2"
                  style={{ bottom: barHeight / 2 }}
                >
                  <Text
                    style={{
                      color:
                        point.trend === 'up'
                          ? theme.colors.success.DEFAULT
                          : point.trend === 'down'
                            ? theme.colors.error.DEFAULT
                            : colors.text.secondary,
                      fontSize: 10,
                    }}
                  >
                    {point.trend === 'up' ? '↗' : point.trend === 'down' ? '↘' : '→'}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* X-axis labels */}
      {showLabels && (
        <View className="flex-row justify-between px-4 mt-2">
          {chartData.points.map((point, index) => (
            <View
              key={`label-${index}`}
              className="items-center"
              style={{ width: barWidth }}
            >
              <Text
                className="text-xs"
                style={{ color: colors.text.secondary }}
                numberOfLines={1}
              >
                {point.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Summary */}
      <View
        className="flex-row justify-between mt-4 pt-3"
        style={{ borderTopWidth: 1, borderTopColor: colors.border }}
      >
        <View className="items-center flex-1">
          <Text className="text-xs" style={{ color: colors.text.secondary }}>
            Mínimo
          </Text>
          <Text
            className="text-sm font-semibold"
            style={{ color: theme.colors.error.DEFAULT }}
          >
            {formatValue(chartData.minValue)}
          </Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-xs" style={{ color: colors.text.secondary }}>
            Média
          </Text>
          <Text
            className="text-sm font-semibold"
            style={{ color: colors.text.primary }}
          >
            {formatValue(chartData.average)}
          </Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-xs" style={{ color: colors.text.secondary }}>
            Máximo
          </Text>
          <Text
            className="text-sm font-semibold"
            style={{ color: theme.colors.success.DEFAULT }}
          >
            {formatValue(chartData.maxValue)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export const LineChart = memo(LineChartComponent);
