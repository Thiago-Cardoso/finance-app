/**
 * ContributionForm Component
 *
 * Modal para adicionar contribuição manual a uma meta.
 */

import React, { useCallback } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react-native';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/hooks/useTheme';
import { useGoalViewModel } from '@/viewModels/useGoal.viewModel';
import { contributionSchema, getDefaultContributionValues } from '@/shared/schemas/goal.schema';
import type { ContributionFormData } from '@/shared/schemas/goal.schema';

interface ContributionFormProps {
  goalId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ContributionForm({ goalId, onSuccess, onCancel }: ContributionFormProps) {
  const { colors, theme } = useTheme();
  const { addContribution, isLoading } = useGoalViewModel();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema) as any,
    defaultValues: getDefaultContributionValues(),
  });

  const onSubmit = useCallback(
    async (data: ContributionFormData) => {
      const result = await addContribution(goalId, data);

      if (result.success) {
        Alert.alert('Sucesso', 'Contribuição adicionada!', [{ text: 'OK', onPress: onSuccess }]);
      } else {
        Alert.alert('Erro', result.error || 'Erro ao adicionar contribuição');
      }
    },
    [goalId, addContribution, onSuccess]
  );

  return (
    <Modal visible transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-end">
        <View
          className="rounded-t-3xl p-6"
          style={{ backgroundColor: colors.background, minHeight: 300 }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold" style={{ color: colors.text.primary }}>
              Adicionar Contribuição
            </Text>
            <TouchableOpacity onPress={onCancel}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Valor */}
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
              Valor *
            </Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: colors.card,
                    color: colors.text.primary,
                    borderWidth: errors.amount ? 1 : 0,
                    borderColor: theme.colors.error.DEFAULT,
                  }}
                  placeholder="R$ 0,00"
                  placeholderTextColor={colors.text.secondary}
                  value={value ? value.toString() : ''}
                  onChangeText={(text) => {
                    const numValue = parseFloat(text.replace(/[^0-9.]/g, ''));
                    onChange(isNaN(numValue) ? 0 : numValue);
                  }}
                  keyboardType="decimal-pad"
                />
              )}
            />
            {errors.amount && (
              <Text className="text-xs mt-1" style={{ color: theme.colors.error.DEFAULT }}>
                {errors.amount.message}
              </Text>
            )}
          </View>

          {/* Descrição */}
          <View className="mb-6">
            <Text className="text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
              Descrição (Opcional)
            </Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: colors.card,
                    color: colors.text.primary,
                    minHeight: 80,
                  }}
                  placeholder="Ex: Salário do mês"
                  placeholderTextColor={colors.text.secondary}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              )}
            />
          </View>

          {/* Botões */}
          <View className="flex-row gap-3">
            <Button onPress={onCancel} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              variant="primary"
              className="flex-1"
            >
              Adicionar
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
