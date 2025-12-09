/**
 * View: GoalForm
 *
 * Formulário para criar/editar metas financeiras.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen } from '@/shared/components/ui/Screen';
import { Button } from '@/shared/components/ui/Button';
import { CurrencyInput } from '@/shared/components/ui/CurrencyInput';
import { DatePickerInput } from '@/shared/components/ui/DatePickerInput';
import { useTheme } from '@/shared/hooks/useTheme';
import { useGoalViewModel } from '@/viewModels/useGoal.viewModel';
import { useCategoryViewModel } from '@/viewModels/useCategory.viewModel';
import { goalSchema, getDefaultGoalValues } from '@/shared/schemas/goal.schema';
import { GoalTypeSelector } from './components/GoalTypeSelector';
import { PrioritySelector } from './components/PrioritySelector';
import { formatCurrency } from '@/shared/utils/formatters';
import type { Goal, CreateGoalData } from '@/shared/models/Goal.model';
import type { GoalFormData } from '@/shared/schemas/goal.schema';

interface GoalFormViewProps {
  goal?: Goal;
  onSuccess: () => void;
  onBack: () => void;
}

export function GoalFormView({ goal, onSuccess, onBack }: GoalFormViewProps) {
  const { colors, theme } = useTheme();
  const { createGoal, updateGoal, isLoading } = useGoalViewModel();
  const { categories, loadCategories } = useCategoryViewModel();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    goal?.category_id || null
  );
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const isEditing = !!goal;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema) as any,
    defaultValues: goal
      ? {
          name: goal.name,
          description: goal.description || '',
          target_amount:
            typeof goal.target_amount === 'string'
              ? parseFloat(goal.target_amount)
              : goal.target_amount,
          target_date: goal.target_date.split('T')[0],
          goal_type: goal.goal_type,
          priority: goal.priority,
          category_id: goal.category_id || undefined,
          baseline_amount:
            goal.baseline_amount !== null
              ? typeof goal.baseline_amount === 'string'
                ? parseFloat(goal.baseline_amount)
                : goal.baseline_amount
              : undefined,
          auto_track_progress: goal.auto_track_progress,
        }
      : getDefaultGoalValues(),
  });

  const autoTrack = watch('auto_track_progress');
  const goalType = watch('goal_type');
  const priority = watch('priority');

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectCategory = useCallback(
    (categoryId: number) => {
      setSelectedCategoryId(categoryId);
      setValue('category_id', categoryId);
      setShowCategoryPicker(false);
    },
    [setValue]
  );

  const onSubmit: SubmitHandler<GoalFormData> = useCallback(
    async (data) => {
      const formData: CreateGoalData = {
        name: data.name,
        description: data.description,
        target_amount: data.target_amount,
        target_date: data.target_date,
        goal_type: data.goal_type,
        priority: data.priority,
        category_id: data.category_id,
        baseline_amount: data.baseline_amount,
        auto_track_progress: data.auto_track_progress,
      };

      let result;
      if (isEditing && goal) {
        result = await updateGoal(goal.id, formData);
      } else {
        result = await createGoal(formData);
      }

      if (result.success) {
        Alert.alert(
          'Sucesso',
          isEditing ? 'Meta atualizada!' : 'Meta criada!',
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        Alert.alert('Erro', result.error || 'Erro ao salvar meta');
      }
    },
    [isEditing, goal, createGoal, updateGoal, onSuccess]
  );

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <Screen
      title={isEditing ? 'Editar Meta' : 'Nova Meta'}
      showHeader
      showBackButton
      onBack={onBack}
      scrollable={false}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Nome */}
        <View className="mb-6">
          <Text className="text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
            Nome da Meta *
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: colors.card,
                  color: colors.text.primary,
                  borderWidth: errors.name ? 1 : 0,
                  borderColor: theme.colors.error.DEFAULT,
                }}
                placeholder="Ex: Viagem de férias"
                placeholderTextColor={colors.text.secondary}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.name && (
            <Text className="text-xs mt-1" style={{ color: theme.colors.error.DEFAULT }}>
              {errors.name.message}
            </Text>
          )}
        </View>

        {/* Tipo de Meta */}
        <View className="mb-6">
          <Text className="text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
            Tipo de Meta *
          </Text>
          <Controller
            control={control}
            name="goal_type"
            render={({ field: { onChange, value } }) => (
              <GoalTypeSelector selectedType={value} onSelect={onChange} />
            )}
          />
          {errors.goal_type && (
            <Text className="text-xs mt-1" style={{ color: theme.colors.error.DEFAULT }}>
              {errors.goal_type.message}
            </Text>
          )}
        </View>

        {/* Valor Alvo */}
        <View className="mb-6">
          <Text className="text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
            Valor Alvo *
          </Text>
          <Controller
            control={control}
            name="target_amount"
            render={({ field: { onChange, value } }) => (
              <CurrencyInput
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: colors.card,
                  color: colors.text.primary,
                  borderWidth: errors.target_amount ? 1 : 0,
                  borderColor: theme.colors.error.DEFAULT,
                }}
                placeholderTextColor={colors.text.secondary}
                value={value || 0}
                onChangeValue={onChange}
              />
            )}
          />
          {errors.target_amount && (
            <Text className="text-xs mt-1" style={{ color: theme.colors.error.DEFAULT }}>
              {errors.target_amount.message}
            </Text>
          )}
        </View>

        {/* Data Limite */}
        <View className="mb-6">
          <Text className="text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
            Data Limite *
          </Text>
          <Controller
            control={control}
            name="target_date"
            render={({ field: { onChange, value } }) => (
              <DatePickerInput
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: colors.card,
                  color: colors.text.primary,
                  borderWidth: errors.target_date ? 1 : 0,
                  borderColor: theme.colors.error.DEFAULT,
                }}
                placeholderTextColor={colors.text.secondary}
                value={value || ''}
                onChangeValue={onChange}
                minimumDate={new Date()}
                iconColor={colors.text.secondary}
              />
            )}
          />
          {errors.target_date && (
            <Text className="text-xs mt-1" style={{ color: theme.colors.error.DEFAULT }}>
              {errors.target_date.message}
            </Text>
          )}
        </View>

        {/* Prioridade */}
        <View className="mb-6">
          <Text className="text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
            Prioridade
          </Text>
          <Controller
            control={control}
            name="priority"
            render={({ field: { onChange, value } }) => (
              <PrioritySelector selectedPriority={value} onSelect={onChange} />
            )}
          />
        </View>

        {/* Categoria (Opcional) */}
        <View className="mb-6">
          <Text className="text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
            Categoria (Opcional)
          </Text>
          <TouchableOpacity
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            className="p-4 rounded-xl flex-row items-center justify-between"
            style={{ backgroundColor: colors.card }}
          >
            {selectedCategory ? (
              <View className="flex-row items-center">
                <View
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: selectedCategory.color || theme.colors.primary.DEFAULT }}
                />
                <Text style={{ color: colors.text.primary }}>{selectedCategory.name}</Text>
              </View>
            ) : (
              <Text style={{ color: colors.text.secondary }}>Selecione uma categoria</Text>
            )}
          </TouchableOpacity>

          {/* Category Picker */}
          {showCategoryPicker && (
            <View
              className="mt-2 rounded-xl overflow-hidden"
              style={{ backgroundColor: colors.card }}
            >
              {categories.length === 0 ? (
                <View className="p-4">
                  <Text style={{ color: colors.text.secondary }}>Nenhuma categoria encontrada</Text>
                </View>
              ) : (
                categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => handleSelectCategory(Number(category.id))}
                    className="p-4 flex-row items-center"
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      backgroundColor:
                        selectedCategoryId === Number(category.id)
                          ? `${theme.colors.primary.DEFAULT}10`
                          : 'transparent',
                    }}
                  >
                    <View
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: category.color || theme.colors.primary.DEFAULT }}
                    />
                    <Text style={{ color: colors.text.primary }}>{category.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        {/* Descrição (Opcional) */}
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
                  minHeight: 100,
                }}
                placeholder="Adicione uma descrição..."
                placeholderTextColor={colors.text.secondary}
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            )}
          />
        </View>

        {/* Auto Track Progress */}
        <View className="mb-6">
          <View
            className="p-4 rounded-xl flex-row items-center justify-between"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-1 mr-4">
              <Text className="text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                Rastrear Progresso Automaticamente
              </Text>
              <Text className="text-xs" style={{ color: colors.text.secondary }}>
                Atualizar automaticamente com base nas transações
              </Text>
            </View>
            <Controller
              control={control}
              name="auto_track_progress"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: colors.border, true: theme.colors.primary.DEFAULT }}
                />
              )}
            />
          </View>
        </View>

        {/* Botão de Salvar */}
        <Button
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={isLoading}
          variant="primary"
          className="mt-6"
        >
          {isEditing ? 'Atualizar Meta' : 'Criar Meta'}
        </Button>
      </ScrollView>
    </Screen>
  );
}
