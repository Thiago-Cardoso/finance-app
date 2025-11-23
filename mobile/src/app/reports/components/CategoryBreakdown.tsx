/**
 * Component: CategoryBreakdown
 *
 * Ranking of categories with progress bars and percentages.
 */

import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { Card } from '@/shared/components/ui/Card';
import { formatCurrency, formatPercent } from '@/shared/utils/formatters';
import type { CategoryBreakdown as CategoryBreakdownType } from '@/shared/types/analytics';

export interface CategoryBreakdownProps {
  /**
   * Category breakdown data
   */
  data: CategoryBreakdownType[];

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Title for the section
   */
  title?: string;

  /**
   * Maximum items to show
   */
  maxItems?: number;
}

/**
 * Category item component
 */
function CategoryItem({
  category,
  maxAmount,
  index,
}: {
  category: CategoryBreakdownType;
  maxAmount: number;
  index: number;
}) {
  const { colors, theme } = useTheme();
  const categoryColor = category.category_color || category.color || theme.colors.primary.DEFAULT;
  const progressWidth = maxAmount > 0 ? (category.amount / maxAmount) * 100 : 0;

  return (
    <View className="mb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1">
          {/* Rank Badge */}
          <View
            className="w-6 h-6 rounded-full items-center justify-center mr-3"
            style={{
              backgroundColor: index < 3 ? categoryColor : colors.border,
            }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: index < 3 ? '#FFFFFF' : colors.text.secondary }}
            >
              {index + 1}
            </Text>
          </View>

          {/* Category Name */}
          <Text
            className="text-sm font-medium flex-1"
            style={{ color: colors.text.primary }}
            numberOfLines={1}
          >
            {category.category_name}
          </Text>
        </View>

        {/* Amount and Percentage */}
        <View className="items-end">
          <Text
            className="text-sm font-semibold"
            style={{ color: colors.text.primary }}
          >
            {formatCurrency(category.amount)}
          </Text>
          <Text
            className="text-xs"
            style={{ color: colors.text.secondary }}
          >
            {formatPercent(category.percentage)}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="flex-row items-center">
        <View
          className="h-2 rounded-full flex-1 overflow-hidden"
          style={{ backgroundColor: colors.border }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${progressWidth}%`,
              backgroundColor: categoryColor,
            }}
          />
        </View>
        <Text
          className="text-xs ml-2 w-10 text-right"
          style={{ color: colors.text.secondary }}
        >
          {category.transaction_count || category.count || 0}
        </Text>
      </View>
    </View>
  );
}

/**
 * Skeleton for loading state
 */
function CategoryBreakdownSkeleton({ count = 5 }: { count?: number }) {
  const { colors } = useTheme();

  return (
    <Card className="p-4 mb-4">
      <View
        className="w-40 h-5 rounded mb-4"
        style={{ backgroundColor: colors.border }}
      />
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center flex-1">
              <View
                className="w-6 h-6 rounded-full mr-3"
                style={{ backgroundColor: colors.border }}
              />
              <View
                className="w-24 h-4 rounded"
                style={{ backgroundColor: colors.border }}
              />
            </View>
            <View
              className="w-20 h-4 rounded"
              style={{ backgroundColor: colors.border }}
            />
          </View>
          <View
            className="h-2 rounded-full"
            style={{ backgroundColor: colors.border }}
          />
        </View>
      ))}
    </Card>
  );
}

function CategoryBreakdownComponent({
  data,
  isLoading = false,
  title = 'Ranking de Categorias',
  maxItems = 10,
}: CategoryBreakdownProps) {
  const { colors } = useTheme();

  if (isLoading) {
    return <CategoryBreakdownSkeleton count={maxItems} />;
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-4 mb-4">
        <Text
          className="text-lg font-semibold mb-2"
          style={{ color: colors.text.primary }}
        >
          {title}
        </Text>
        <View className="items-center justify-center py-8">
          <Text
            className="text-base"
            style={{ color: colors.text.secondary }}
          >
            Sem dados para o período selecionado
          </Text>
        </View>
      </Card>
    );
  }

  const displayData = data.slice(0, maxItems);
  const maxAmount = Math.max(...displayData.map((c) => c.amount));
  const totalAmount = displayData.reduce((sum, c) => sum + c.amount, 0);

  return (
    <Card className="p-4 mb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text
          className="text-lg font-semibold"
          style={{ color: colors.text.primary }}
        >
          {title}
        </Text>
        <Text
          className="text-sm"
          style={{ color: colors.text.secondary }}
        >
          Total: {formatCurrency(totalAmount)}
        </Text>
      </View>

      {/* Category List */}
      {displayData.map((category, index) => (
        <CategoryItem
          key={category.category_id || category.category_name}
          category={category}
          maxAmount={maxAmount}
          index={index}
        />
      ))}

      {/* Show more indicator */}
      {data.length > maxItems && (
        <Text
          className="text-sm text-center mt-2"
          style={{ color: colors.text.secondary }}
        >
          +{data.length - maxItems} categorias adicionais
        </Text>
      )}
    </Card>
  );
}

export const CategoryBreakdown = memo(CategoryBreakdownComponent);
export default CategoryBreakdown;
