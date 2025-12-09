/**
 * ProgressBar Component
 *
 * Barra de progresso linear para metas.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

interface ProgressBarProps {
  percentage: number;
  color?: string;
  height?: number;
  showPercentage?: boolean;
}

export function ProgressBar({
  percentage,
  color,
  height = 6,
  showPercentage = false,
}: ProgressBarProps) {
  const { colors, theme } = useTheme();

  const progressColor = color || theme.colors.primary.DEFAULT;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <View>
      {/* Barra */}
      <View
        className="rounded-full overflow-hidden"
        style={{
          height,
          backgroundColor: colors.border,
        }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${clampedPercentage}%`,
            backgroundColor: progressColor,
          }}
        />
      </View>

      {/* Percentual (opcional) */}
      {showPercentage && (
        <Text
          className="text-xs text-right mt-1"
          style={{ color: colors.text.secondary }}
        >
          {clampedPercentage.toFixed(1)}%
        </Text>
      )}
    </View>
  );
}
