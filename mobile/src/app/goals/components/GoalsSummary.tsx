/**
 * GoalsSummary Component
 *
 * Resumo consolidado das metas.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Target, TrendingUp, CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatters';
import type { Goal } from '@/shared/models/Goal.model';

interface GoalsSummaryProps {
  meta: {
    total_count: number;
    active_count: number;
    completed_count: number;
    total_target_amount: string | number;
    total_current_amount: string | number;
  };
  activeGoals: Goal[];
}

export function GoalsSummary({ meta, activeGoals }: GoalsSummaryProps) {
  const { colors, theme } = useTheme();

  const totalTarget =
    typeof meta.total_target_amount === 'string'
      ? parseFloat(meta.total_target_amount)
      : meta.total_target_amount;

  const totalCurrent =
    typeof meta.total_current_amount === 'string'
      ? parseFloat(meta.total_current_amount)
      : meta.total_current_amount;

  const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  return (
    <View className="mx-4 mb-4">
      {/* Card principal */}
      <View className="p-4 rounded-xl mb-3" style={{ backgroundColor: colors.card }}>
        {/* Header */}
        <View className="flex-row items-center mb-3">
          <Target size={24} color={colors.primary} />
          <Text className="text-lg font-bold ml-2" style={{ color: colors.text.primary }}>
            Resumo das Metas
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row justify-between">
          {/* Total de metas */}
          <View className="flex-1">
            <Text className="text-xs mb-1" style={{ color: colors.text.secondary }}>
              Total de Metas
            </Text>
            <Text className="text-2xl font-bold" style={{ color: colors.text.primary }}>
              {meta.total_count}
            </Text>
          </View>

          {/* Ativas */}
          <View className="flex-1">
            <Text className="text-xs mb-1" style={{ color: colors.text.secondary }}>
              Ativas
            </Text>
            <View className="flex-row items-center">
              <TrendingUp size={16} color={theme.colors.primary.DEFAULT} />
              <Text
                className="text-2xl font-bold ml-1"
                style={{ color: theme.colors.primary.DEFAULT }}
              >
                {meta.active_count}
              </Text>
            </View>
          </View>

          {/* Concluídas */}
          <View className="flex-1 items-end">
            <Text className="text-xs mb-1" style={{ color: colors.text.secondary }}>
              Concluídas
            </Text>
            <View className="flex-row items-center">
              <CheckCircle size={16} color={theme.colors.success.DEFAULT} />
              <Text
                className="text-2xl font-bold ml-1"
                style={{ color: theme.colors.success.DEFAULT }}
              >
                {meta.completed_count}
              </Text>
            </View>
          </View>
        </View>

        {/* Progresso geral */}
        {meta.active_count > 0 && (
          <>
            <View className="mt-4 pt-4 border-t" style={{ borderTopColor: colors.border }}>
              <Text className="text-xs mb-2" style={{ color: colors.text.secondary }}>
                Progresso Geral
              </Text>

              {/* Barra de progresso */}
              <View className="mb-2">
                <View
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: colors.border }}
                >
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(overallProgress, 100)}%`,
                      backgroundColor: theme.colors.primary.DEFAULT,
                    }}
                  />
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-sm" style={{ color: colors.text.primary }}>
                  {formatCurrency(totalCurrent)} de {formatCurrency(totalTarget)}
                </Text>
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                  {overallProgress.toFixed(1)}%
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
