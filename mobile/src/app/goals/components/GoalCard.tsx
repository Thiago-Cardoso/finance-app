/**
 * GoalCard Component
 *
 * Card exibindo informações resumidas de uma meta.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Target, TrendingUp, Calendar, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { ProgressBar } from './ProgressBar';
import { GoalTypeIcon } from './GoalTypeIcon';
import { StatusBadge } from './StatusBadge';
import { formatCurrency } from '@/shared/utils/formatters';
import type { Goal } from '@/shared/models/Goal.model';
import { getGoalTypeText, isGoalOnTrack, isGoalOverdue } from '@/shared/models/Goal.model';

interface GoalCardProps {
  goal: Goal;
  onPress: () => void;
}

export function GoalCard({ goal, onPress }: GoalCardProps) {
  const { colors, theme } = useTheme();

  // Cálculos
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

  // Cor do indicador de progresso
  const progressColor = isOverdue
    ? theme.colors.error.DEFAULT
    : isOnTrack
      ? theme.colors.success.DEFAULT
      : theme.colors.warning.DEFAULT;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="mx-4 mb-3">
      <View className="p-4 rounded-xl" style={{ backgroundColor: colors.card }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            {/* Ícone do tipo */}
            <GoalTypeIcon type={goal.goal_type} size={24} color={colors.primary} />

            <View className="flex-1 ml-3">
              <Text
                className="text-base font-semibold"
                style={{ color: colors.text.primary }}
                numberOfLines={1}
              >
                {goal.name}
              </Text>
              <Text className="text-xs" style={{ color: colors.text.secondary }}>
                {getGoalTypeText(goal.goal_type)}
              </Text>
            </View>
          </View>

          {/* Status Badge */}
          <View className="mr-2">
            <StatusBadge status={goal.status} />
          </View>

          <ChevronRight size={20} color={colors.text.secondary} />
        </View>

        {/* Progress Bar */}
        <View className="mb-3">
          <ProgressBar percentage={progressPercentage} color={progressColor} height={8} />
        </View>

        {/* Stats */}
        <View className="flex-row items-center justify-between">
          {/* Valor atual / Alvo */}
          <View className="flex-1">
            <Text className="text-xs mb-1" style={{ color: colors.text.secondary }}>
              Progresso
            </Text>
            <Text className="text-sm font-semibold" style={{ color: colors.text.primary }}>
              {formatCurrency(currentAmount)} / {formatCurrency(targetAmount)}
            </Text>
          </View>

          {/* Dias restantes ou status */}
          <View className="items-end">
            {goal.status === 'active' && (
              <>
                <Text className="text-xs mb-1" style={{ color: colors.text.secondary }}>
                  {isOverdue ? 'Atrasado' : 'Restam'}
                </Text>
                <View className="flex-row items-center">
                  {isOverdue && <AlertCircle size={14} color={theme.colors.error.DEFAULT} />}
                  <Text
                    className="text-sm font-semibold ml-1"
                    style={{
                      color: isOverdue ? theme.colors.error.DEFAULT : colors.text.primary,
                    }}
                  >
                    {Math.abs(goal.days_remaining)} dias
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Indicador de progresso */}
        {goal.status === 'active' && (
          <View className="mt-2 pt-2 border-t" style={{ borderTopColor: colors.border }}>
            <View className="flex-row items-center">
              {isOnTrack ? (
                <>
                  <TrendingUp size={14} color={theme.colors.success.DEFAULT} />
                  <Text
                    className="text-xs ml-1"
                    style={{ color: theme.colors.success.DEFAULT }}
                  >
                    No ritmo esperado
                  </Text>
                </>
              ) : (
                <>
                  <AlertCircle size={14} color={theme.colors.warning.DEFAULT} />
                  <Text
                    className="text-xs ml-1"
                    style={{ color: theme.colors.warning.DEFAULT }}
                  >
                    Fora do ritmo
                  </Text>
                </>
              )}
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
