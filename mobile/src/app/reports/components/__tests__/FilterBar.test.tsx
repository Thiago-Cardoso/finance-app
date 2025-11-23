/**
 * Tests for FilterBar component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterBar } from '../FilterBar';
import type { ReportFilterOptions } from '@/shared/types/analytics';

// Mock the theme hook
jest.mock('@/shared/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: {
        primary: '#111827',
        secondary: '#6B7280',
        disabled: '#9CA3AF',
      },
      background: '#FFFFFF',
      surface: '#F9FAFB',
      border: '#E5E7EB',
    },
    theme: {
      colors: {
        primary: {
          DEFAULT: '#5843BE',
          light: '#E8E5F9',
        },
        success: {
          DEFAULT: '#10B981',
        },
        error: {
          DEFAULT: '#EF4444',
        },
      },
    },
    isDark: false,
  }),
}));

// Mock the categories store
jest.mock('@/shared/stores/categoriesStore', () => ({
  useCategoriesStore: () => ({
    categories: [
      { id: '1', name: 'Alimentação', color: '#FF6B6B' },
      { id: '2', name: 'Transporte', color: '#4ECDC4' },
    ],
    fetchCategories: jest.fn(),
  }),
}));

const defaultFilters: ReportFilterOptions = {
  periodType: 'monthly',
  transactionType: 'all',
};

describe('FilterBar Component', () => {
  const mockOnFiltersChange = jest.fn();
  const mockOnResetFilters = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render period chips', () => {
      const { getByText } = render(
        <FilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onResetFilters={mockOnResetFilters}
        />
      );

      expect(getByText('Mês')).toBeTruthy();
      expect(getByText('Trim.')).toBeTruthy();
      expect(getByText('Ano')).toBeTruthy();
    });

    it('should render filter button', () => {
      const { getByText } = render(
        <FilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onResetFilters={mockOnResetFilters}
        />
      );

      expect(getByText('Filtros')).toBeTruthy();
    });

    it('should highlight active period', () => {
      const { getByText } = render(
        <FilterBar
          filters={{ ...defaultFilters, periodType: 'yearly' }}
          onFiltersChange={mockOnFiltersChange}
          onResetFilters={mockOnResetFilters}
        />
      );

      // The "Ano" chip should be rendered and active
      expect(getByText('Ano')).toBeTruthy();
    });
  });

  describe('Interaction', () => {
    it('should call onFiltersChange when period chip is pressed', () => {
      const { getByText } = render(
        <FilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onResetFilters={mockOnResetFilters}
        />
      );

      fireEvent.press(getByText('Ano'));

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          periodType: 'yearly',
        })
      );
    });

    it('should call onFiltersChange when quarterly is selected', () => {
      const { getByText } = render(
        <FilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onResetFilters={mockOnResetFilters}
        />
      );

      fireEvent.press(getByText('Trim.'));

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          periodType: 'quarterly',
        })
      );
    });
  });

  describe('Filter Badge', () => {
    it('should show filter count when filters are active', () => {
      const { getByText } = render(
        <FilterBar
          filters={{
            ...defaultFilters,
            periodType: 'yearly',
            transactionType: 'expense',
          }}
          onFiltersChange={mockOnFiltersChange}
          onResetFilters={mockOnResetFilters}
        />
      );

      // Should show count badge (2 active filters: non-default period + transaction type)
      expect(getByText('2')).toBeTruthy();
    });

    it('should not show filter count when using default filters', () => {
      const { queryByText } = render(
        <FilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onResetFilters={mockOnResetFilters}
        />
      );

      // Should not show count badge for default filters
      const badge = queryByText('0');
      expect(badge).toBeNull();
    });
  });

  describe('Filter Modal', () => {
    it('should open filter modal when filter button is pressed', () => {
      const { getByText } = render(
        <FilterBar
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onResetFilters={mockOnResetFilters}
        />
      );

      fireEvent.press(getByText('Filtros'));

      // Modal should now be visible with transaction type options
      expect(getByText('Tipo de Transação')).toBeTruthy();
      expect(getByText('Todos')).toBeTruthy();
      expect(getByText('Receitas')).toBeTruthy();
      expect(getByText('Despesas')).toBeTruthy();
    });

    it('should call onResetFilters when clear button is pressed', () => {
      const { getByText } = render(
        <FilterBar
          filters={{ ...defaultFilters, transactionType: 'expense' }}
          onFiltersChange={mockOnFiltersChange}
          onResetFilters={mockOnResetFilters}
        />
      );

      fireEvent.press(getByText('Filtros'));
      fireEvent.press(getByText('Limpar Filtros'));

      expect(mockOnResetFilters).toHaveBeenCalled();
    });
  });
});
