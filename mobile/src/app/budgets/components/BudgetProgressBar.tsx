/**
 * Component: BudgetProgressBar
 *
 * Barra de progresso colorida para orçamentos.
 * Cores: verde (< 70%), amarelo (70-99%), vermelho (>= 100%)
 */

import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency, formatPercent } from '@/shared/utils/formatters';
import type { BudgetStatus } from '@/shared/models/Budget.model';

interface BudgetProgressBarProps {
  spent: number;
  limit: number;
  percentage?: number;
  status?: BudgetStatus;
  showValues?: boolean;
  showPercentage?: boolean;
  height?: number;
  categoryColor?: string;
}

/**
 * Retorna cor baseada no percentual ou status
 */
function getProgressColor(percentage: number, status?: BudgetStatus): string {
  if (status) {
    switch (status) {
      case 'on_track':
        return '#10B981'; // Verde
      case 'warning':
        return '#F59E0B'; // Amarelo
      case 'critical':
        return '#EF4444'; // Vermelho
      case 'over_budget':
        return '#DC2626'; // Vermelho escuro
    }
  }

  // Fallback baseado em percentual
  if (percentage >= 100) return '#DC2626';
  if (percentage >= 90) return '#EF4444';
  if (percentage >= 70) return '#F59E0B';
  return '#10B981';
}

/**
 * Retorna texto do status
 */
function getStatusText(percentage: number, status?: BudgetStatus): string {
  if (status === 'over_budget' || percentage >= 100) return 'Excedido';
  if (status === 'critical' || percentage >= 90) return 'Crítico';
  if (status === 'warning' || percentage >= 70) return 'Atenção';
  return 'No limite';
}

function BudgetProgressBarComponent({
  spent,
  limit,
  percentage: providedPercentage,
  status,
  showValues = true,
  showPercentage = true,
  height = 8,
  categoryColor,
}: BudgetProgressBarProps) {
  const { colors } = useTheme();

  // Calcular percentual se não fornecido
  const percentage = providedPercentage ?? (limit > 0 ? (spent / limit) * 100 : 0);
  const remaining = limit - spent;
  const isOverBudget = percentage >= 100;

  // Cor da barra de progresso
  const progressColor = categoryColor || getProgressColor(percentage, status);

  // Largura visual (cap em 100% para visual, mas mostra valor real)
  const visualWidth = Math.min(percentage, 100);

  return (
    <View>
      {/* Valores */}
      {showValues && (
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm" style={{ color: colors.text.secondary }}>
            Gasto: <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
              {formatCurrency(spent)}
            </Text>
          </Text>
          <Text className="text-sm" style={{ color: colors.text.secondary }}>
            Limite: <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
              {formatCurrency(limit)}
            </Text>
          </Text>
        </View>
      )}

      {/* Barra de progresso */}
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
            width: `${visualWidth}%`,
            backgroundColor: progressColor,
          }}
        />
      </View>

      {/* Rodapé com percentual e status */}
      {showPercentage && (
        <View className="flex-row justify-between mt-2">
          <Text
            className="text-xs font-medium"
            style={{ color: progressColor }}
          >
            {formatPercent(percentage)}
            {isOverBudget && ' do limite'}
          </Text>
          <Text
            className="text-xs"
            style={{
              color: isOverBudget ? progressColor : colors.text.secondary,
              fontWeight: isOverBudget ? '600' : '400',
            }}
          >
            {isOverBudget
              ? `Excedido em ${formatCurrency(Math.abs(remaining))}`
              : `Restam ${formatCurrency(remaining)}`}
          </Text>
        </View>
      )}
    </View>
  );
}

export const BudgetProgressBar = memo(BudgetProgressBarComponent);

/**
 * Versão compacta para listas
 */
interface CompactProgressBarProps {
  percentage: number;
  status?: BudgetStatus;
  height?: number;
}

function CompactProgressBarComponent({
  percentage,
  status,
  height = 4,
}: CompactProgressBarProps) {
  const { colors } = useTheme();
  const progressColor = getProgressColor(percentage, status);
  const visualWidth = Math.min(percentage, 100);

  return (
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
          width: `${visualWidth}%`,
          backgroundColor: progressColor,
        }}
      />
    </View>
  );
}

export const CompactProgressBar = memo(CompactProgressBarComponent);
