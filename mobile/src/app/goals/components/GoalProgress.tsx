/**
 * GoalProgress Component
 *
 * Exibe o progresso visual da meta com estatísticas.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { TrendingUp, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { CircularProgress } from './CircularProgress';
import { formatCurrency } from '@/shared/utils/formatters';
import { isGoalOnTrack, isGoalOverdue } from '@/shared/models/Goal.model';
import type { Goal } from '@/shared/models/Goal.model';

interface GoalProgressProps {
  goal: Goal;
}

export function GoalProgress({ goal }: GoalProgressProps) {
  const { colors, theme } = useTheme();

  const progressPercentage =
    typeof goal.progress_percentage === 'string'
      ? parseFloat(goal.progress_percentage)
      : goal.progress_percentage;

  const currentAmount =
    typeof goal.current_amount === 'string'
      ? parseFloat(goal.current_amount)
      : goal.current_amount;

  const targetAmount =
    typeof goal.target_amount === 'string'
      ? parseFloat(goal.target_amount)
      : goal.target_amount;

  const remainingAmount =
    typeof goal.remaining_amount === 'string'
      ? parseFloat(goal.remaining_amount)
      : goal.remaining_amount;

  const isOnTrack = isGoalOnTrack(goal);
  const isOverdue = isGoalOverdue(goal);

  const progressColor = isOverdue
    ? theme.colors.error.DEFAULT
    : isOnTrack
      ? theme.colors.success.DEFAULT
      : theme.colors.warning.DEFAULT;

  return (
    <View>
      {/* Circular Progress */}
      <View className="items-center mb-4">
        <CircularProgress percentage={progressPercentage} size={120} strokeWidth={12} color={progressColor} />
      </View>

      {/* Stats */}
      <View className="flex-row justify-between mb-3">
        <View className="flex-1">
          <Text className="text-xs mb-1" style={{ color: colors.text.secondary }}>
            Valor Atual
          </Text>
          <Text className="text-lg font-bold" style={{ color: colors.text.primary }}>
            {formatCurrency(currentAmount)}
          </Text>
        </View>

        <View className="flex-1 items-end">
          <Text className="text-xs mb-1" style={{ color: colors.text.secondary }}>
            Valor Alvo
          </Text>
          <Text className="text-lg font-bold" style={{ color: colors.text.primary }}>
            {formatCurrency(targetAmount)}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between">
        <View className="flex-1">
          <Text className="text-xs mb-1" style={{ color: colors.text.secondary }}>
            Faltam
          </Text>
          <Text className="text-base font-semibold" style={{ color: colors.text.primary }}>
            {formatCurrency(remainingAmount)}
          </Text>
        </View>

        <View className="flex-1 items-end">
          <Text className="text-xs mb-1" style={{ color: colors.text.secondary }}>
            Progresso
          </Text>
          <Text className="text-base font-semibold" style={{ color: progressColor }}>
            {progressPercentage.toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Indicador de ritmo */}
      {goal.status === 'active' && (
        <View className="mt-3 pt-3 border-t" style={{ borderTopColor: colors.border }}>
          <View className="flex-row items-center">
            {isOnTrack ? (
              <>
                <TrendingUp size={16} color={theme.colors.success.DEFAULT} />
                <Text className="text-sm ml-2" style={{ color: theme.colors.success.DEFAULT }}>
                  No ritmo esperado para atingir a meta
                </Text>
              </>
            ) : (
              <>
                <AlertCircle size={16} color={theme.colors.warning.DEFAULT} />
                <Text className="text-sm ml-2" style={{ color: theme.colors.warning.DEFAULT }}>
                  Fora do ritmo - aumente as contribuições
                </Text>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
