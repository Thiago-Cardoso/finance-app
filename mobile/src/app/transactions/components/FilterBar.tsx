/**
 * Component: FilterBar
 *
 * Barra de filtros avançados para transações.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, X } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import type { TransactionFilters } from '@/shared/models/Transaction.model';

interface FilterBarProps {
  filters: TransactionFilters;
  onFilterChange: (filters: TransactionFilters) => void;
  onClearFilters: () => void;
}

type PeriodOption = {
  value: 'this_month' | 'last_month' | 'this_year' | 'last_year';
  label: string;
};

const periodOptions: PeriodOption[] = [
  { value: 'this_month', label: 'Este mês' },
  { value: 'last_month', label: 'Mês passado' },
  { value: 'this_year', label: 'Este ano' },
  { value: 'last_year', label: 'Ano passado' },
];

export function FilterBar({
  filters,
  onFilterChange,
  onClearFilters,
}: FilterBarProps) {
  const { colors, theme } = useTheme();

  const hasActiveFilters =
    filters.period ||
    filters.category_id ||
    filters.account_id ||
    filters.min_amount ||
    filters.max_amount;

  const handlePeriodChange = (period: PeriodOption['value'] | null) => {
    onFilterChange({
      ...filters,
      period: period || undefined,
      start_date: undefined,
      end_date: undefined,
    });
  };

  return (
    <View className="mb-4">
      {/* Period Filters */}
      <View className="mb-3">
        <Text
          className="text-sm font-medium mb-2"
          style={{ color: colors.text.secondary }}
        >
          Período
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {periodOptions.map((option) => {
              const isActive = filters.period === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() =>
                    handlePeriodChange(isActive ? null : option.value)
                  }
                  className="px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: isActive
                      ? theme.colors.primary.DEFAULT
                      : colors.surface,
                    borderWidth: 1,
                    borderColor: isActive
                      ? theme.colors.primary.DEFAULT
                      : colors.border,
                  }}
                >
                  <Text
                    className="text-sm"
                    style={{
                      color: isActive ? '#FFFFFF' : colors.text.primary,
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <TouchableOpacity
          onPress={onClearFilters}
          className="flex-row items-center self-start px-3 py-2 rounded-full"
          style={{ backgroundColor: `${theme.colors.error.DEFAULT}20` }}
        >
          <X size={14} color={theme.colors.error.DEFAULT} />
          <Text
            className="text-sm ml-1"
            style={{ color: theme.colors.error.DEFAULT }}
          >
            Limpar filtros
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
