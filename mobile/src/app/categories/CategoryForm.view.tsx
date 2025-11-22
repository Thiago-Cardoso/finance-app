/**
 * View: CategoryForm
 *
 * Formulário para criar/editar categorias.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen } from '@/shared/components/ui/Screen';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/hooks/useTheme';
import { useCategoryViewModel } from '@/viewModels/useCategory.viewModel';
import { categorySchema, type CategoryFormData } from '@/shared/schemas/category.schema';
import { getIconByName } from '@/shared/constants/icons';
import { IconPicker } from './components/IconPicker';
import { ColorPicker } from './components/ColorPicker';
import type { Category, CategoryType } from '@/shared/models/Category.model';

interface CategoryFormViewProps {
  category?: Category;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryFormView({
  category,
  onSuccess,
  onCancel,
}: CategoryFormViewProps) {
  const { colors, theme } = useTheme();
  const { createCategory, updateCategory, isLoading, error, clearErrors } =
    useCategoryViewModel();

  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const isEditing = !!category;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
      icon: category?.icon ?? 'Tag',
      color: category?.color ?? '#5843BE',
      category_type: category?.category_type ?? 'expense',
    },
  });

  const watchedValues = watch();
  const SelectedIcon = useMemo(
    () => getIconByName(watchedValues.icon),
    [watchedValues.icon]
  );

  const onSubmit = useCallback(
    async (data: CategoryFormData) => {
      clearErrors();

      let result;
      if (isEditing && category) {
        result = await updateCategory(category.id, data);
      } else {
        result = await createCategory(data);
      }

      if (result.success) {
        onSuccess();
      } else {
        Alert.alert(
          'Erro',
          error || 'Não foi possível salvar a categoria. Tente novamente.'
        );
      }
    },
    [isEditing, category, createCategory, updateCategory, clearErrors, onSuccess, error]
  );

  const categoryTypes: Array<{ value: CategoryType; label: string }> = [
    { value: 'expense', label: 'Despesa' },
    { value: 'income', label: 'Receita' },
    { value: 'both', label: 'Ambos' },
  ];

  return (
    <Screen
      title={isEditing ? 'Editar Categoria' : 'Nova Categoria'}
      showHeader
      showBackButton
      onBackPress={onCancel}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Preview */}
        <View
          className="items-center py-6 mb-6 rounded-xl"
          style={{ backgroundColor: colors.background.secondary }}
        >
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: watchedValues.color + '20' }}
          >
            {SelectedIcon && (
              <SelectedIcon size={40} color={watchedValues.color} />
            )}
          </View>
          <Text
            className="text-lg font-semibold"
            style={{ color: colors.text.primary }}
          >
            {watchedValues.name || 'Nome da categoria'}
          </Text>
        </View>

        {/* Name Input */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nome"
              placeholder="Ex: Alimentação"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
              maxLength={50}
              editable={!category?.is_default}
              containerClassName="mb-4"
            />
          )}
        />

        {/* Icon Selector */}
        <View className="mb-4">
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: colors.text.secondary }}
          >
            Ícone
          </Text>
          <TouchableOpacity
            onPress={() => setShowIconPicker(true)}
            className="flex-row items-center p-4 rounded-xl"
            style={{ backgroundColor: colors.background.secondary }}
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: watchedValues.color + '20' }}
            >
              {SelectedIcon && (
                <SelectedIcon size={24} color={watchedValues.color} />
              )}
            </View>
            <View className="flex-1">
              <Text style={{ color: colors.text.primary }}>
                {watchedValues.icon}
              </Text>
              <Text className="text-sm" style={{ color: colors.text.tertiary }}>
                Toque para alterar
              </Text>
            </View>
          </TouchableOpacity>
          {errors.icon && (
            <Text className="text-sm mt-1" style={{ color: theme.colors.error }}>
              {errors.icon.message}
            </Text>
          )}
        </View>

        {/* Color Selector */}
        <View className="mb-4">
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: colors.text.secondary }}
          >
            Cor
          </Text>
          <TouchableOpacity
            onPress={() => setShowColorPicker(true)}
            className="flex-row items-center p-4 rounded-xl"
            style={{ backgroundColor: colors.background.secondary }}
          >
            <View
              className="w-12 h-12 rounded-full mr-3"
              style={{ backgroundColor: watchedValues.color }}
            />
            <View className="flex-1">
              <Text style={{ color: colors.text.primary }}>
                {watchedValues.color.toUpperCase()}
              </Text>
              <Text className="text-sm" style={{ color: colors.text.tertiary }}>
                Toque para alterar
              </Text>
            </View>
          </TouchableOpacity>
          {errors.color && (
            <Text className="text-sm mt-1" style={{ color: theme.colors.error }}>
              {errors.color.message}
            </Text>
          )}
        </View>

        {/* Category Type Selector */}
        <View className="mb-6">
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: colors.text.secondary }}
          >
            Tipo de Categoria
          </Text>
          <Controller
            control={control}
            name="category_type"
            render={({ field: { value, onChange } }) => (
              <View className="flex-row">
                {categoryTypes.map((type) => {
                  const isSelected = value === type.value;
                  return (
                    <TouchableOpacity
                      key={type.value}
                      onPress={() => onChange(type.value)}
                      disabled={category?.is_default}
                      className="flex-1 py-3 items-center rounded-xl mx-1"
                      style={{
                        backgroundColor: isSelected
                          ? watchedValues.color + '20'
                          : colors.background.secondary,
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: watchedValues.color,
                        opacity: category?.is_default ? 0.6 : 1,
                      }}
                    >
                      <Text
                        className="font-medium"
                        style={{
                          color: isSelected
                            ? watchedValues.color
                            : colors.text.secondary,
                        }}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          />
        </View>

        {/* Default Category Warning */}
        {category?.is_default && (
          <View
            className="p-3 rounded-lg mb-4"
            style={{ backgroundColor: theme.colors.warning + '20' }}
          >
            <Text className="text-sm text-center" style={{ color: theme.colors.warning }}>
              Esta é uma categoria padrão. Apenas o ícone e a cor podem ser alterados.
            </Text>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View
            className="p-3 rounded-lg mb-4"
            style={{ backgroundColor: theme.colors.error + '20' }}
          >
            <Text className="text-sm text-center" style={{ color: theme.colors.error }}>
              {error}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View className="pb-8">
          <Button
            title={isEditing ? 'Salvar Alterações' : 'Criar Categoria'}
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={!isDirty}
            className="mb-3"
          />
          <Button
            title="Cancelar"
            variant="outline"
            onPress={onCancel}
            disabled={isLoading}
          />
        </View>
      </ScrollView>

      {/* Icon Picker Modal */}
      <IconPicker
        visible={showIconPicker}
        selectedIcon={watchedValues.icon}
        color={watchedValues.color}
        onSelect={(icon) => setValue('icon', icon, { shouldDirty: true })}
        onClose={() => setShowIconPicker(false)}
      />

      {/* Color Picker Modal */}
      <ColorPicker
        visible={showColorPicker}
        selectedColor={watchedValues.color}
        onSelect={(color) => setValue('color', color, { shouldDirty: true })}
        onClose={() => setShowColorPicker(false)}
      />
    </Screen>
  );
}

export default CategoryFormView;
