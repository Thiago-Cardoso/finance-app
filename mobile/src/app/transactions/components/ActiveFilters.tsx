/**
 * Component: ActiveFilters
 *
 * Horizontal scrollable chips showing active filters with remove option.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { X, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';

/**
 * Filter chip data structure
 */
export interface FilterChip {
  key: string;
  label: string;
  value: string | number | string[];
  color?: string;
}

export interface ActiveFiltersProps {
  /**
   * List of active filter chips
   */
  filters: FilterChip[];

  /**
   * Callback when a filter chip is removed
   */
  onRemove: (key: string) => void;

  /**
   * Callback to clear all filters
   */
  onClearAll: () => void;

  /**
   * Show clear all button
   */
  showClearAll?: boolean;

  /**
   * Custom class name
   */
  className?: string;
}

export function ActiveFilters({
  filters,
  onRemove,
  onClearAll,
  showClearAll = true,
  className = '',
}: ActiveFiltersProps) {
  const { theme } = useTheme();

  if (filters.length === 0) {
    return null;
  }

  return (
    <View className={`mb-4 ${className}`}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {/* Filter Chips */}
        {filters.map((filter) => (
          <FilterChipItem
            key={filter.key}
            filter={filter}
            onRemove={() => onRemove(filter.key)}
          />
        ))}

        {/* Clear All Button */}
        {showClearAll && filters.length > 1 && (
          <TouchableOpacity
            onPress={onClearAll}
            className="flex-row items-center px-3 py-2 rounded-full mr-2"
            style={{
              backgroundColor: `${theme.colors.error.DEFAULT}15`,
              borderWidth: 1,
              borderColor: theme.colors.error.DEFAULT,
            }}
          >
            <Trash2 size={14} color={theme.colors.error.DEFAULT} />
            <Text
              className="text-xs font-medium ml-1"
              style={{ color: theme.colors.error.DEFAULT }}
            >
              Limpar
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

/**
 * Individual filter chip
 */
interface FilterChipItemProps {
  filter: FilterChip;
  onRemove: () => void;
}

function FilterChipItem({ filter, onRemove }: FilterChipItemProps) {
  const { theme } = useTheme();
  const chipColor = filter.color || theme.colors.primary.DEFAULT;

  return (
    <View
      className="flex-row items-center px-3 py-2 rounded-full mr-2"
      style={{
        backgroundColor: `${chipColor}15`,
        borderWidth: 1,
        borderColor: chipColor,
      }}
    >
      <Text
        className="text-xs font-medium"
        style={{ color: chipColor }}
        numberOfLines={1}
      >
        {filter.label}
      </Text>
      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        className="ml-2"
        accessibilityLabel={`Remover filtro ${filter.label}`}
        accessibilityRole="button"
      >
        <X size={14} color={chipColor} />
      </TouchableOpacity>
    </View>
  );
}

/**
 * Compact version for smaller spaces
 */
export interface ActiveFiltersCompactProps {
  /**
   * Number of active filters
   */
  count: number;

  /**
   * Callback when pressed
   */
  onPress: () => void;

  /**
   * Custom class name
   */
  className?: string;
}

export function ActiveFiltersCompact({
  count,
  onPress,
  className = '',
}: ActiveFiltersCompactProps) {
  const { theme } = useTheme();

  if (count === 0) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center px-3 py-1 rounded-full ${className}`}
      style={{
        backgroundColor: theme.colors.primary[100],
        borderWidth: 1,
        borderColor: theme.colors.primary.DEFAULT,
      }}
    >
      <Text
        className="text-xs font-medium"
        style={{ color: theme.colors.primary.DEFAULT }}
      >
        {count} {count === 1 ? 'filtro' : 'filtros'}
      </Text>
      <X size={12} color={theme.colors.primary.DEFAULT} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );
}

export default ActiveFilters;
