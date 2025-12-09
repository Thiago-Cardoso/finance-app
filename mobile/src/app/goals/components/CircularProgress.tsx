/**
 * CircularProgress Component
 *
 * Indicador de progresso circular.
 */

import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/shared/hooks/useTheme';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showPercentage?: boolean;
}

export function CircularProgress({
  percentage,
  size = 100,
  strokeWidth = 10,
  color,
  showPercentage = true,
}: CircularProgressProps) {
  const { colors, theme } = useTheme();

  const progressColor = color || theme.colors.primary.DEFAULT;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>

      {/* Percentage Text */}
      {showPercentage && (
        <View style={{ position: 'absolute' }} className="items-center justify-center">
          <Text className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            {clampedPercentage.toFixed(0)}%
          </Text>
        </View>
      )}
    </View>
  );
}
