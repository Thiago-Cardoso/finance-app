/**
 * View: GoalDetail
 *
 * Tela de detalhes de uma meta financeira.
 */

import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Edit2, Trash2, Plus } from 'lucide-react-native';
import { Screen } from '@/shared/components/ui/Screen';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/hooks/useTheme';
import { useGoalViewModel } from '@/viewModels/useGoal.viewModel';
import { GoalProgress } from './components/GoalProgress';
import { StatusBadge } from './components/StatusBadge';
import { GoalTypeIcon } from './components/GoalTypeIcon';
import { ContributionForm } from './components/ContributionForm';
import { formatCurrency, formatDate } from '@/shared/utils/formatters';
import {
  getGoalTypeText,
  getGoalPriorityText,
  isGoalOnTrack,
  isGoalOverdue,
} from '@/shared/models/Goal.model';
import type { Goal } from '@/shared/models/Goal.model';

interface GoalDetailViewProps {
  goalId: number;
  onEdit: (goal: Goal) => void;
  onBack: () => void;
}

export function GoalDetailView({ goalId, onEdit, onBack }: GoalDetailViewProps) {
  const { colors, theme } = useTheme();
  const { loadGoalById, deleteGoal, selectedGoal, isLoading } = useGoalViewModel();

  const [showContributionForm, setShowContributionForm] = useState(false);

  useEffect(() => {
    loadGoalById(goalId);
  }, [goalId, loadGoalById]);

  const handleDelete = useCallback(() => {
    Alert.alert('Excluir Meta', 'Tem certeza que deseja excluir esta meta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          const result = await deleteGoal(goalId);
          if (result.success) {
            Alert.alert('Sucesso', 'Meta excluída!', [{ text: 'OK', onPress: onBack }]);
          } else {
            Alert.alert('Erro', result.error || 'Erro ao excluir meta');
          }
        },
      },
    ]);
  }, [goalId, deleteGoal, onBack]);

  const handleEdit = useCallback(() => {
    if (selectedGoal) {
      onEdit(selectedGoal);
    }
  }, [selectedGoal, onEdit]);

  if (!selectedGoal || isLoading) {
    return (
      <Screen title="Carregando..." showBackButton onBack={onBack}>
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: colors.text.secondary }}>Carregando meta...</Text>
        </View>
      </Screen>
    );
  }

  const goal = selectedGoal;
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

  const monthlyTarget = goal.monthly_target
    ? typeof goal.monthly_target === 'string'
      ? parseFloat(goal.monthly_target)
      : goal.monthly_target
    : 0;

  return (
    <Screen
      title={goal.name}
      showBackButton
      onBack={onBack}
      scrollable={false}
      rightAction={
        <TouchableOpacity onPress={handleEdit}>
          <Edit2 size={24} color={colors.primary} />
        </TouchableOpacity>
      }
    >
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Header Card */}
        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: colors.card }}>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1">
              <GoalTypeIcon type={goal.goal_type} size={32} color={colors.primary} />
              <View className="ml-3 flex-1">
                <Text className="text-lg font-bold" style={{ color: colors.text.primary }}>
                  {goal.name}
                </Text>
                <Text className="text-sm" style={{ color: colors.text.secondary }}>
                  {getGoalTypeText(goal.goal_type)}
                </Text>
              </View>
            </View>
            <StatusBadge status={goal.status} size="medium" />
          </View>

          {goal.description && (
            <Text className="text-sm mb-4" style={{ color: colors.text.secondary }}>
              {goal.description}
            </Text>
          )}

          {/* Progresso */}
          <GoalProgress goal={goal} />
        </View>

        {/* Informações */}
        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: colors.card }}>
          <Text className="text-lg font-bold mb-3" style={{ color: colors.text.primary }}>
            Informações
          </Text>

          <View className="space-y-3">
            {/* Data Limite */}
            <View className="flex-row justify-between items-center py-2">
              <Text style={{ color: colors.text.secondary }}>Data Limite</Text>
              <Text className="font-semibold" style={{ color: colors.text.primary }}>
                {formatDate(goal.target_date)}
              </Text>
            </View>

            {/* Dias Restantes */}
            <View className="flex-row justify-between items-center py-2">
              <Text style={{ color: colors.text.secondary }}>
                {isGoalOverdue(goal) ? 'Atrasado há' : 'Dias Restantes'}
              </Text>
              <Text
                className="font-semibold"
                style={{
                  color: isGoalOverdue(goal) ? theme.colors.error.DEFAULT : colors.text.primary,
                }}
              >
                {Math.abs(goal.days_remaining)} dias
              </Text>
            </View>

            {/* Prioridade */}
            <View className="flex-row justify-between items-center py-2">
              <Text style={{ color: colors.text.secondary }}>Prioridade</Text>
              <Text className="font-semibold" style={{ color: colors.text.primary }}>
                {getGoalPriorityText(goal.priority)}
              </Text>
            </View>

            {/* Meta Mensal */}
            {monthlyTarget > 0 && (
              <View className="flex-row justify-between items-center py-2">
                <Text style={{ color: colors.text.secondary }}>Meta Mensal</Text>
                <Text className="font-semibold" style={{ color: colors.text.primary }}>
                  {formatCurrency(monthlyTarget)}
                </Text>
              </View>
            )}

            {/* Categoria */}
            {goal.category && (
              <View className="flex-row justify-between items-center py-2">
                <Text style={{ color: colors.text.secondary }}>Categoria</Text>
                <View className="flex-row items-center">
                  <View
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: goal.category.color }}
                  />
                  <Text className="font-semibold" style={{ color: colors.text.primary }}>
                    {goal.category.name}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Contribuições */}
        {goal.status === 'active' && (
          <View className="mb-4">
            <Button
              onPress={() => setShowContributionForm(true)}
              variant="outline"
              leftIcon={Plus}
            >
              Adicionar Contribuição
            </Button>
          </View>
        )}

        {/* Ações de Exclusão */}
        <View className="mt-4">
          <Button onPress={handleDelete} variant="danger" leftIcon={Trash2}>
            Excluir Meta
          </Button>
        </View>
      </ScrollView>

      {/* Modal de Contribuição */}
      {showContributionForm && (
        <ContributionForm
          goalId={goalId}
          onSuccess={() => {
            setShowContributionForm(false);
            loadGoalById(goalId);
          }}
          onCancel={() => setShowContributionForm(false)}
        />
      )}
    </Screen>
  );
}
