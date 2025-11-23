/**
 * Component: PieChart
 *
 * Gráfico de pizza usando barras de progresso horizontais.
 * Alternativa leve ao Victory Native para evitar problemas de compatibilidade.
 */

import React, { memo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency, formatPercent } from '@/shared/utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface PieChartDataItem {
  label: string;
  value: number;
  color: string;
}

export interface PieChartProps {
  data: PieChartDataItem[];
  width?: number;
  height?: number;
  title?: string;
  showTotal?: boolean;
  formatValue?: (value: number) => string;
  isLoading?: boolean;
}

/**
 * Skeleton loader for PieChart
 */
function PieChartSkeleton({ width = SCREEN_WIDTH - 48 }: { width?: number }) {
  const { colors } = useTheme();

  return (
    <View style={{ width }}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center flex-1">
              <View
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: colors.border }}
              />
              <View
                className="h-4 rounded"
                style={{ backgroundColor: colors.border, width: 80 }}
              />
            </View>
            <View
              className="h-4 rounded"
              style={{ backgroundColor: colors.border, width: 60 }}
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
 * PieChart component using progress bars
 */
function PieChartComponent({
  data,
  width = SCREEN_WIDTH - 48,
  title,
  showTotal = true,
  formatValue = formatCurrency,
  isLoading = false,
}: PieChartProps) {
  const { colors } = useTheme();

  if (isLoading) {
    return <PieChartSkeleton width={width} />;
  }

  if (!data || data.length === 0) {
    return (
      <View style={{ width }} className="items-center justify-center py-8">
        <Text className="text-base" style={{ color: colors.text.secondary }}>
          Sem dados disponíveis
        </Text>
      </View>
    );
  }

  // Calculate total and percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

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

      {/* List of items with progress bars */}
      <View>
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;

          return (
            <View key={`${item.label}-${index}`} className="mb-4">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <Text
                    className="text-sm font-medium flex-1"
                    style={{ color: colors.text.primary }}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </View>
                <Text
                  className="text-sm font-semibold ml-2"
                  style={{ color: colors.text.primary }}
                >
                  {formatValue(item.value)}
                </Text>
              </View>

              {/* Progress bar */}
              <View
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.border }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: item.color,
                    width: `${Math.min(percentage, 100)}%`,
                  }}
                />
              </View>

              {/* Percentage */}
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
      {showTotal && (
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
            {formatValue(total)}
          </Text>
        </View>
      )}
    </View>
  );
}

export const PieChart = memo(PieChartComponent);
