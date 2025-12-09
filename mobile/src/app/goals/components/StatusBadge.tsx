/**
 * StatusBadge Component
 *
 * Badge mostrando o status da meta.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { getGoalStatusText, getGoalStatusColor } from '@/shared/models/Goal.model';
import type { GoalStatus } from '@/shared/models/Goal.model';

interface StatusBadgeProps {
  status: GoalStatus;
  size?: 'small' | 'medium' | 'large';
}

export function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const { colors } = useTheme();

  const statusColor = getGoalStatusColor(status);
  const statusText = getGoalStatusText(status);

  const textSizeClass = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  }[size];

  const paddingClass = {
    small: 'px-2 py-1',
    medium: 'px-3 py-1.5',
    large: 'px-4 py-2',
  }[size];

  return (
    <View
      className={`${paddingClass} rounded-lg`}
      style={{ backgroundColor: `${statusColor}15` }}
    >
      <Text className={`${textSizeClass} font-semibold`} style={{ color: statusColor }}>
        {statusText}
      </Text>
    </View>
  );
}
