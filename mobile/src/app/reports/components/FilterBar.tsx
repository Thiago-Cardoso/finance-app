/**
 * Component: FilterBar
 *
 * Filter bar for reports with period, type, and category filters.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Filter, X, Check } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { Button } from '@/shared/components/ui/Button';
import { DateRangePicker } from '@/shared/components/ui/DateRangePicker';
import { PERIOD_OPTIONS, type ReportFilterOptions } from '@/shared/types/analytics';
import { useCategoriesStore } from '@/shared/stores/categoriesStore';

export interface FilterBarProps {
  /**
   * Current filter options
   */
  filters: ReportFilterOptions;

  /**
   * Callback when filters change
   */
  onFiltersChange: (filters: Partial<ReportFilterOptions>) => void;

  /**
   * Callback to reset filters
   */
  onResetFilters: () => void;
}

type TransactionTypeOption = 'all' | 'income' | 'expense';

const TRANSACTION_TYPE_OPTIONS: Array<{
  value: TransactionTypeOption;
  label: string;
}> = [
  { value: 'all', label: 'Todos' },
  { value: 'income', label: 'Receitas' },
  { value: 'expense', label: 'Despesas' },
];

export function FilterBar({
  filters,
  onFiltersChange,
  onResetFilters,
}: FilterBarProps) {
  const { colors, theme } = useTheme();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { categories, fetchCategories } = useCategoriesStore();

  // Fetch categories on mount
  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /**
   * Get active filters count
   */
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.periodType !== 'monthly') count++;
    if (filters.transactionType && filters.transactionType !== 'all') count++;
    if (filters.categoryIds && filters.categoryIds.length > 0) count++;
    if (filters.startDate || filters.endDate) count++;
    return count;
  }, [filters]);

  /**
   * Handle period change
   */
  const handlePeriodChange = (periodType: ReportFilterOptions['periodType']) => {
    if (periodType === 'custom_range') {
      // Show date range picker
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      onFiltersChange({
        periodType,
        startDate: startOfMonth,
        endDate: endOfMonth,
      });
    } else {
      onFiltersChange({
        periodType,
        startDate: undefined,
        endDate: undefined,
      });
    }
  };

  /**
   * Handle transaction type change
   */
  const handleTypeChange = (type: TransactionTypeOption) => {
    onFiltersChange({ transactionType: type });
  };

  /**
   * Handle category toggle
   */
  const handleCategoryToggle = (categoryId: number) => {
    const currentIds = filters.categoryIds || [];
    const newIds = currentIds.includes(categoryId)
      ? currentIds.filter((id) => id !== categoryId)
      : [...currentIds, categoryId];
    onFiltersChange({ categoryIds: newIds.length > 0 ? newIds : undefined });
  };

  /**
   * Handle date range change
   */
  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    onFiltersChange({ startDate, endDate });
  };

  return (
    <View className="mb-4">
      {/* Quick Filters Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {/* Period Chips */}
        {PERIOD_OPTIONS.filter((o) => o.value !== 'custom_range').map((option) => {
          const isActive = filters.periodType === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => handlePeriodChange(option.value)}
              className="mr-2 px-4 py-2 rounded-full"
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
                className="text-sm font-medium"
                style={{
                  color: isActive ? '#FFFFFF' : colors.text.primary,
                }}
              >
                {option.shortLabel}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* More Filters Button */}
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          className="flex-row items-center px-4 py-2 rounded-full"
          style={{
            backgroundColor: activeFiltersCount > 0
              ? theme.colors.primary[100]
              : colors.surface,
            borderWidth: 1,
            borderColor: activeFiltersCount > 0
              ? theme.colors.primary.DEFAULT
              : colors.border,
          }}
        >
          <Filter
            size={16}
            color={activeFiltersCount > 0 ? theme.colors.primary.DEFAULT : colors.text.secondary}
          />
          <Text
            className="text-sm font-medium ml-1"
            style={{
              color: activeFiltersCount > 0
                ? theme.colors.primary.DEFAULT
                : colors.text.primary,
            }}
          >
            Filtros
          </Text>
          {activeFiltersCount > 0 && (
            <View
              className="ml-1 w-5 h-5 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.colors.primary.DEFAULT }}
            >
              <Text className="text-xs font-bold text-white">
                {activeFiltersCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Date Range (shown when custom_range is selected) */}
      {filters.periodType === 'custom_range' && (
        <View className="px-4 mt-3">
          <DateRangePicker
            startDate={filters.startDate || new Date()}
            endDate={filters.endDate || new Date()}
            onChange={handleDateRangeChange}
          />
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            className="rounded-t-3xl pt-4 pb-8 max-h-[80%]"
            style={{ backgroundColor: colors.background }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 mb-4">
              <Text
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Filtros
              </Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <X size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-4">
              {/* Transaction Type */}
              <View className="mb-6">
                <Text
                  className="text-sm font-medium mb-3"
                  style={{ color: colors.text.secondary }}
                >
                  Tipo de Transação
                </Text>
                <View className="flex-row flex-wrap">
                  {TRANSACTION_TYPE_OPTIONS.map((option) => {
                    const isActive = filters.transactionType === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => handleTypeChange(option.value)}
                        className="mr-2 mb-2 px-4 py-2 rounded-lg flex-row items-center"
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
                        {isActive && (
                          <Check size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                        )}
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
              </View>

              {/* Categories */}
              <View className="mb-6">
                <Text
                  className="text-sm font-medium mb-3"
                  style={{ color: colors.text.secondary }}
                >
                  Categorias ({filters.categoryIds?.length || 0} selecionadas)
                </Text>
                <View className="flex-row flex-wrap">
                  {categories.slice(0, 12).map((category) => {
                    const isActive = filters.categoryIds?.includes(
                      Number(category.id)
                    );
                    return (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() => handleCategoryToggle(Number(category.id))}
                        className="mr-2 mb-2 px-3 py-2 rounded-lg flex-row items-center"
                        style={{
                          backgroundColor: isActive
                            ? (category.color || theme.colors.primary.DEFAULT) + '20'
                            : colors.surface,
                          borderWidth: 1,
                          borderColor: isActive
                            ? category.color || theme.colors.primary.DEFAULT
                            : colors.border,
                        }}
                      >
                        {isActive && (
                          <Check
                            size={14}
                            color={category.color || theme.colors.primary.DEFAULT}
                            style={{ marginRight: 4 }}
                          />
                        )}
                        <Text
                          className="text-sm"
                          style={{
                            color: isActive
                              ? category.color || theme.colors.primary.DEFAULT
                              : colors.text.primary,
                          }}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Actions */}
            <View className="flex-row px-4 pt-4 border-t" style={{ borderTopColor: colors.border }}>
              <Button
                title="Limpar Filtros"
                variant="outline"
                onPress={() => {
                  onResetFilters();
                  setShowFilterModal(false);
                }}
                className="flex-1 mr-2"
              />
              <Button
                title="Aplicar"
                onPress={() => setShowFilterModal(false)}
                className="flex-1 ml-2"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default FilterBar;
