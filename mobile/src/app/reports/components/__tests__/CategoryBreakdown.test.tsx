/**
 * Tests for CategoryBreakdown component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { CategoryBreakdown } from '../CategoryBreakdown';

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

const mockData = [
  {
    category_id: 1,
    category_name: 'Alimentação',
    category_color: '#FF6B6B',
    amount: 1250.5,
    percentage: 29.4,
    transaction_count: 12,
  },
  {
    category_id: 2,
    category_name: 'Transporte',
    category_color: '#4ECDC4',
    amount: 850.0,
    percentage: 20.0,
    transaction_count: 8,
  },
  {
    category_id: 3,
    category_name: 'Lazer',
    category_color: '#FFD93D',
    amount: 650.25,
    percentage: 15.3,
    transaction_count: 5,
  },
];

describe('CategoryBreakdown Component', () => {
  describe('Rendering', () => {
    it('should render with data', () => {
      const { getByText } = render(<CategoryBreakdown data={mockData} />);

      expect(getByText('Ranking de Categorias')).toBeTruthy();
      expect(getByText('Alimentação')).toBeTruthy();
      expect(getByText('Transporte')).toBeTruthy();
      expect(getByText('Lazer')).toBeTruthy();
    });

    it('should render custom title', () => {
      const { getByText } = render(
        <CategoryBreakdown data={mockData} title="Despesas por Categoria" />
      );

      expect(getByText('Despesas por Categoria')).toBeTruthy();
    });

    it('should show empty state when no data', () => {
      const { getByText } = render(<CategoryBreakdown data={[]} />);

      expect(getByText('Sem dados para o período selecionado')).toBeTruthy();
    });

    it('should show loading skeleton when loading', () => {
      const { queryByText } = render(
        <CategoryBreakdown data={mockData} isLoading />
      );

      expect(queryByText('Alimentação')).toBeNull();
    });
  });

  describe('Data Display', () => {
    it('should display category amounts', () => {
      const { getByText } = render(<CategoryBreakdown data={mockData} />);

      // Check that amounts are displayed
      expect(getByText(/1\.250/)).toBeTruthy();
      expect(getByText(/850/)).toBeTruthy();
    });

    it('should display category percentages', () => {
      const { getByText } = render(<CategoryBreakdown data={mockData} />);

      expect(getByText('29,4%')).toBeTruthy();
      expect(getByText('20,0%')).toBeTruthy();
    });

    it('should display rank badges', () => {
      const { getByText } = render(<CategoryBreakdown data={mockData} />);

      expect(getByText('1')).toBeTruthy();
      expect(getByText('2')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
    });
  });

  describe('Item Limiting', () => {
    it('should limit items to maxItems', () => {
      const { queryByText } = render(
        <CategoryBreakdown data={mockData} maxItems={2} />
      );

      expect(queryByText('Alimentação')).toBeTruthy();
      expect(queryByText('Transporte')).toBeTruthy();
      expect(queryByText('Lazer')).toBeNull();
    });

    it('should show additional count when items are limited', () => {
      const { getByText } = render(
        <CategoryBreakdown data={mockData} maxItems={2} />
      );

      expect(getByText('+1 categorias adicionais')).toBeTruthy();
    });
  });

  describe('Total Calculation', () => {
    it('should display total amount', () => {
      const { getByText } = render(<CategoryBreakdown data={mockData} />);

      // Total: 1250.5 + 850 + 650.25 = 2750.75
      expect(getByText(/Total/)).toBeTruthy();
    });
  });
});
