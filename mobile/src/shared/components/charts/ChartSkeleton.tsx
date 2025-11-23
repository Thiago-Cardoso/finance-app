/**
 * Component: ChartSkeleton
 *
 * Componentes de skeleton loading para gráficos.
 */

import React, { memo, useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { CHART_DEFAULTS } from './chartTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ChartSkeletonProps {
  width?: number;
  height?: number;
  variant?: 'pie' | 'line' | 'bar' | 'progress';
}

/**
 * Hook para animação de pulso
 */
function usePulseAnimation() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return opacity;
}

/**
 * Skeleton base com animação
 */
function SkeletonBox({
  width,
  height,
  borderRadius = 4,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const { colors } = useTheme();
  const opacity = usePulseAnimation();

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * Skeleton para PieChart (lista de progresso)
 */
function PieChartSkeleton({ width = SCREEN_WIDTH - 48 }: { width?: number }) {
  return (
    <View style={{ width }}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.pieItem}>
          <View style={styles.pieHeader}>
            <View style={styles.pieLabel}>
              <SkeletonBox width={12} height={12} borderRadius={6} />
              <SkeletonBox width={80} height={16} style={styles.marginLeft8} />
            </View>
            <SkeletonBox width={60} height={16} />
          </View>
          <SkeletonBox width="100%" height={8} borderRadius={4} />
        </View>
      ))}
    </View>
  );
}

/**
 * Skeleton para LineChart
 */
function LineChartSkeleton({
  width = SCREEN_WIDTH - 48,
  height = CHART_DEFAULTS.height,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <View style={{ width }}>
      {/* Chart area */}
      <View style={[styles.chartArea, { height: height - 60 }]}>
        <View style={styles.lineChartBars}>
          {[60, 80, 45, 90, 70, 85].map((h, i) => (
            <SkeletonBox
              key={i}
              width={16}
              height={`${h}%`}
              borderRadius={8}
            />
          ))}
        </View>
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxisLabels}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonBox key={i} width={24} height={12} />
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.summaryItem}>
            <SkeletonBox width={40} height={10} />
            <SkeletonBox width={50} height={14} style={styles.marginTop4} />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Skeleton para BarChart
 */
function BarChartSkeleton({
  width = SCREEN_WIDTH - 48,
  height = 250,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <View style={{ width }}>
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <SkeletonBox width={12} height={12} borderRadius={6} />
          <SkeletonBox width={60} height={14} style={styles.marginLeft8} />
        </View>
        <View style={styles.legendItem}>
          <SkeletonBox width={12} height={12} borderRadius={6} />
          <SkeletonBox width={60} height={14} style={styles.marginLeft8} />
        </View>
      </View>

      {/* Chart area */}
      <View style={[styles.barChartArea, { height: height - 100 }]}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.barGroup}>
            <SkeletonBox width={20} height={`${40 + i * 10}%`} borderRadius={4} />
            <SkeletonBox
              width={20}
              height={`${60 - i * 5}%`}
              borderRadius={4}
              style={styles.marginLeft4}
            />
          </View>
        ))}
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxisLabels}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBox key={i} width={32} height={12} />
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.summaryItem}>
            <SkeletonBox width={60} height={10} />
            <SkeletonBox width={50} height={14} style={styles.marginTop4} />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Skeleton para ProgressBar simples
 */
function ProgressSkeleton({ width = SCREEN_WIDTH - 48 }: { width?: number }) {
  return (
    <View style={{ width }}>
      <View style={styles.progressHeader}>
        <SkeletonBox width={100} height={16} />
        <SkeletonBox width={60} height={16} />
      </View>
      <SkeletonBox width="100%" height={8} borderRadius={4} />
      <View style={[styles.progressHeader, styles.marginTop8]}>
        <SkeletonBox width={80} height={12} />
        <SkeletonBox width={40} height={12} />
      </View>
    </View>
  );
}

/**
 * Componente principal de ChartSkeleton
 */
function ChartSkeletonComponent({
  width = SCREEN_WIDTH - 48,
  height = CHART_DEFAULTS.height,
  variant = 'line',
}: ChartSkeletonProps) {
  switch (variant) {
    case 'pie':
      return <PieChartSkeleton width={width} />;
    case 'bar':
      return <BarChartSkeleton width={width} height={height} />;
    case 'progress':
      return <ProgressSkeleton width={width} />;
    case 'line':
    default:
      return <LineChartSkeleton width={width} height={height} />;
  }
}

const styles = StyleSheet.create({
  // Pie chart styles
  pieItem: {
    marginBottom: 16,
  },
  pieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pieLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Line chart styles
  chartArea: {
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
  },
  lineChartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
  },

  // Bar chart styles
  barChartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  barGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  // Common styles
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },

  // Progress styles
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  // Margin utilities
  marginLeft4: {
    marginLeft: 4,
  },
  marginLeft8: {
    marginLeft: 8,
  },
  marginTop4: {
    marginTop: 4,
  },
  marginTop8: {
    marginTop: 8,
  },
});

export const ChartSkeleton = memo(ChartSkeletonComponent);

// Export individual skeletons for specific use
export {
  PieChartSkeleton,
  LineChartSkeleton,
  BarChartSkeleton,
  ProgressSkeleton,
};
