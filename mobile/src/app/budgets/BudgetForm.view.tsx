/**
 * View: BudgetForm
 *
 * Formulário para criar/editar orçamentos.
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
import { useTheme } from '@/shared/hooks/useTheme';
import { useBudgetViewModel } from '@/viewModels/useBudget.viewModel';
import { useCategoryViewModel } from '@/viewModels/useCategory.viewModel';
import { budgetSchema, getDefaultBudgetValues } from '@/shared/schemas/budget.schema';
import type { Budget, BudgetFormData } from '@/shared/models/Budget.model';
import type { BudgetSchemaType } from '@/shared/schemas/budget.schema';

interface BudgetFormViewProps {
  budget?: Budget;
  onSuccess: () => void;
  onBack: () => void;
}

export function BudgetFormView({ budget, onSuccess, onBack }: BudgetFormViewProps) {
  const { colors, theme } = useTheme();
  const { createBudget, updateBudget, isLoading } = useBudgetViewModel();
  const { categories, loadCategories } = useCategoryViewModel();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    budget?.category_id ? String(budget.category_id) : null
  );
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const isEditing = !!budget;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BudgetSchemaType>({
    resolver: zodResolver(budgetSchema) as any,
    defaultValues: budget
      ? {
          category_id: budget.category_id,
          limit_amount: budget.limit_amount,
          period_start: budget.period_start,
          period_end: budget.period_end,
          period_type: budget.period_type,
          alert_threshold: budget.alert_threshold,
          is_alert_enabled: budget.is_alert_enabled,
        }
      : getDefaultBudgetValues(),
  });

  const alertEnabled = watch('is_alert_enabled');

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectCategory = useCallback(
    (categoryId: string) => {
      setSelectedCategoryId(categoryId);
      setValue('category_id', Number(categoryId));
      setShowCategoryPicker(false);
    },
    [setValue]
  );

  const onSubmit: SubmitHandler<BudgetSchemaType> = useCallback(
    async (data) => {
      const formData: BudgetFormData = {
        category_id: data.category_id,
        limit_amount: data.limit_amount,
        period_start: data.period_start,
        period_end: data.period_end,
        period_type: data.period_type,
        alert_threshold: data.alert_threshold,
        is_alert_enabled: data.is_alert_enabled,
      };

      let result;
      if (isEditing && budget) {
        result = await updateBudget(budget.id, formData);
      } else {
        result = await createBudget(formData);
      }

      if (result.success) {
        Alert.alert(
          'Sucesso',
          isEditing ? 'Orçamento atualizado!' : 'Orçamento criado!',
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        Alert.alert('Erro', result.error || 'Erro ao salvar orçamento');
      }
    },
    [isEditing, budget, createBudget, updateBudget, onSuccess]
  );

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Filtrar categorias de despesa
  const expenseCategories = categories.filter((c) => c.category_type === 'expense');

  return (
    <Screen
      title={isEditing ? 'Editar Orçamento' : 'Novo Orçamento'}
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
        {/* Categoria */}
        <View className="mb-6">
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: colors.text.primary }}
          >
            Categoria *
          </Text>
          <TouchableOpacity
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            className="p-4 rounded-xl flex-row items-center justify-between"
            style={{
              backgroundColor: colors.card,
              borderWidth: errors.category_id ? 1 : 0,
              borderColor: theme.colors.error.DEFAULT,
            }}
          >
            {selectedCategory ? (
              <View className="flex-row items-center">
                <View
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: selectedCategory.color || theme.colors.primary.DEFAULT }}
                />
                <Text style={{ color: colors.text.primary }}>
                  {selectedCategory.name}
                </Text>
              </View>
            ) : (
              <Text style={{ color: colors.text.secondary }}>
                Selecione uma categoria
              </Text>
            )}
          </TouchableOpacity>
          {errors.category_id && (
            <Text className="text-xs mt-1" style={{ color: theme.colors.error.DEFAULT }}>
              {errors.category_id.message}
            </Text>
          )}

          {/* Category Picker */}
          {showCategoryPicker && (
            <View
              className="mt-2 rounded-xl overflow-hidden"
              style={{ backgroundColor: colors.card }}
            >
              {expenseCategories.length === 0 ? (
                <View className="p-4">
                  <Text style={{ color: colors.text.secondary }}>
                    Nenhuma categoria de despesa encontrada
                  </Text>
                </View>
              ) : (
                expenseCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => handleSelectCategory(category.id)}
                    className="p-4 flex-row items-center"
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      backgroundColor:
                        selectedCategoryId === category.id
                          ? `${theme.colors.primary.DEFAULT}10`
                          : 'transparent',
                    }}
                  >
                    <View
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: category.color || theme.colors.primary.DEFAULT }}
                    />
                    <Text
                      style={{
                        color:
                          selectedCategoryId === category.id
                            ? theme.colors.primary.DEFAULT
                            : colors.text.primary,
                        fontWeight: selectedCategoryId === category.id ? '600' : '400',
                      }}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        {/* Valor Limite */}
        <View className="mb-6">
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: colors.text.primary }}
          >
            Valor Limite *
          </Text>
          <Controller
            control={control}
            name="limit_amount"
            render={({ field: { onChange, value } }) => (
<<<<<<< HEAD
              <CurrencyInput
                value={value || 0}
                onChangeValue={onChange}
                className="p-4 rounded-xl text-lg"
                style={{
                  backgroundColor: colors.card,
                  color: colors.text.primary,
                  borderWidth: errors.limit_amount ? 1 : 0,
                  borderColor: theme.colors.error.DEFAULT,
                }}
                placeholderTextColor={colors.text.secondary}
              />
=======
              <View
                className="p-4 rounded-xl flex-row items-center"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: errors.limit_amount ? 1 : 0,
                  borderColor: theme.colors.error.DEFAULT,
                }}
              >
                <Text
                  className="text-lg mr-2"
                  style={{ color: colors.text.secondary }}
                >
                  R$
                </Text>
                <TextInput
                  className="flex-1 text-lg"
                  style={{ color: colors.text.primary }}
                  placeholder="0,00"
                  placeholderTextColor={colors.text.secondary}
                  keyboardType="numeric"
                  value={value ? value.toString().replace('.', ',') : ''}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9,]/g, '').replace(',', '.');
                    const numValue = parseFloat(cleaned) || 0;
                    onChange(numValue);
                  }}
                />
              </View>
>>>>>>> origin/master
            )}
          />
          {errors.limit_amount && (
            <Text className="text-xs mt-1" style={{ color: theme.colors.error.DEFAULT }}>
              {errors.limit_amount.message}
            </Text>
          )}
        </View>

        {/* Alertas */}
        <View
          className="mb-6 p-4 rounded-xl"
          style={{ backgroundColor: colors.card }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text
                className="text-sm font-medium"
                style={{ color: colors.text.primary }}
              >
                Alertas de Orçamento
              </Text>
              <Text
                className="text-xs"
                style={{ color: colors.text.secondary }}
              >
                Receba notificações quando atingir o limite
              </Text>
            </View>
            <Controller
              control={control}
              name="is_alert_enabled"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{
                    false: colors.border,
                    true: theme.colors.primary.DEFAULT,
                  }}
                />
              )}
            />
          </View>

          {alertEnabled && (
            <View>
              <Text
                className="text-sm mb-2"
                style={{ color: colors.text.secondary }}
              >
                Alertar quando atingir:
              </Text>
              <Controller
                control={control}
                name="alert_threshold"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row">
                    {[70, 80, 90].map((threshold) => (
                      <TouchableOpacity
                        key={threshold}
                        onPress={() => onChange(threshold)}
                        className="flex-1 py-3 items-center rounded-lg mx-1"
                        style={{
                          backgroundColor:
                            value === threshold
                              ? theme.colors.primary.DEFAULT
                              : colors.border,
                        }}
                      >
                        <Text
                          className="font-medium"
                          style={{
                            color: value === threshold ? '#FFFFFF' : colors.text.primary,
                          }}
                        >
                          {threshold}%
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>
          )}
        </View>

        {/* Info */}
        <View
          className="p-4 rounded-xl mb-6"
          style={{ backgroundColor: `${theme.colors.primary.DEFAULT}10` }}
        >
          <Text className="text-xs" style={{ color: colors.text.secondary }}>
            O orçamento será calculado automaticamente para o mês atual. O valor gasto
            será atualizado conforme você adicionar transações na categoria selecionada.
          </Text>
        </View>

        {/* Submit Button */}
        <Button
          title={isEditing ? 'Salvar Alterações' : 'Criar Orçamento'}
          onPress={handleSubmit(onSubmit as any)}
          loading={isLoading}
          disabled={isLoading}
        />
      </ScrollView>
    </Screen>
  );
}

export default BudgetFormView;
