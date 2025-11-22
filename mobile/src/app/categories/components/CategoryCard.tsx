/**
 * Component: CategoryCard
 *
 * Card para exibição de uma categoria na lista.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Lock } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { getIconByName } from '@/shared/constants/icons';
import type { Category } from '@/shared/models/Category.model';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
  onLongPress?: () => void;
  showArrow?: boolean;
  showTransactionsCount?: boolean;
}

export function CategoryCard({
  category,
  onPress,
  onLongPress,
  showArrow = true,
  showTransactionsCount = false,
}: CategoryCardProps) {
  const { colors } = useTheme();
  const IconComponent = getIconByName(category.icon);

  const getCategoryTypeLabel = () => {
    switch (category.category_type) {
      case 'income':
        return 'Receita';
      case 'expense':
        return 'Despesa';
      case 'both':
        return 'Ambos';
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-row items-center p-4 rounded-xl mb-2"
      style={{ backgroundColor: colors.background.secondary }}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: category.color + '20' }}
      >
        {IconComponent && (
          <IconComponent size={24} color={category.color} />
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text
            className="text-base font-semibold"
            style={{ color: colors.text.primary }}
          >
            {category.name}
          </Text>
          {category.is_default && (
            <Lock
              size={14}
              color={colors.text.tertiary}
              className="ml-2"
              style={{ marginLeft: 6 }}
            />
          )}
        </View>

        <View className="flex-row items-center mt-1">
          <View
            className="px-2 py-0.5 rounded-full mr-2"
            style={{ backgroundColor: category.color + '15' }}
          >
            <Text className="text-xs" style={{ color: category.color }}>
              {getCategoryTypeLabel()}
            </Text>
          </View>

          {showTransactionsCount && category.transactions_count !== undefined && (
            <Text className="text-xs" style={{ color: colors.text.tertiary }}>
              {category.transactions_count} transações
            </Text>
          )}
        </View>
      </View>

      {/* Arrow */}
      {showArrow && (
        <ChevronRight size={20} color={colors.text.tertiary} />
      )}
    </TouchableOpacity>
  );
}

export default CategoryCard;
