/**
 * Component: CategorySelector
 *
 * Seletor de categoria para transações.
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Tag } from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { useCategoriesStore } from '@/shared/stores/categoriesStore';
import type { Category, CategoryType } from '@/shared/models/Category.model';

interface CategorySelectorProps {
  value?: string | null;
  onChange: (categoryId: string | null) => void;
  categoryType: 'income' | 'expense';
  error?: string;
  disabled?: boolean;
}

export function CategorySelector({
  value,
  onChange,
  categoryType,
  error,
  disabled = false,
}: CategorySelectorProps) {
  const { colors, theme } = useTheme();
  const {
    categories,
    isLoading,
    fetchCategories,
    getExpenseCategories,
    getIncomeCategories,
  } = useCategoriesStore();

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  const filteredCategories =
    categoryType === 'expense' ? getExpenseCategories() : getIncomeCategories();

  const getIconComponent = (iconName: string): React.ElementType => {
    const IconComponent = (Icons as unknown as Record<string, React.ElementType>)[iconName];
    return IconComponent || Tag;
  };

  const renderCategory = (category: Category) => {
    const isSelected = value === category.id;
    const IconComponent = getIconComponent(category.icon);

    return (
      <TouchableOpacity
        key={category.id}
        onPress={() => !disabled && onChange(isSelected ? null : category.id)}
        className={`items-center justify-center p-3 rounded-xl mr-3 ${
          disabled ? 'opacity-50' : ''
        }`}
        style={{
          backgroundColor: isSelected ? `${category.color}20` : colors.surface,
          borderWidth: 2,
          borderColor: isSelected ? category.color : colors.border,
          minWidth: 80,
        }}
        disabled={disabled}
        accessibilityRole="radio"
        accessibilityState={{ checked: isSelected, disabled }}
        accessibilityLabel={category.name}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mb-1"
          style={{ backgroundColor: `${category.color}30` }}
        >
          <IconComponent size={20} color={category.color} />
        </View>
        <Text
          className="text-xs font-medium text-center"
          style={{
            color: isSelected ? category.color : colors.text.secondary,
          }}
          numberOfLines={1}
        >
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={theme.colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <View>
      <Text
        className="text-sm font-medium mb-2"
        style={{ color: colors.text.primary }}
      >
        Categoria
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 4, paddingRight: 16 }}
      >
        {filteredCategories.map(renderCategory)}
      </ScrollView>

      {error && (
        <Text
          className="text-sm mt-1"
          style={{ color: theme.colors.error.DEFAULT }}
        >
          {error}
        </Text>
      )}

      {filteredCategories.length === 0 && (
        <Text
          className="text-sm text-center py-4"
          style={{ color: colors.text.secondary }}
        >
          Nenhuma categoria disponível
        </Text>
      )}
    </View>
  );
}
