/**
 * Testes do componente Button
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Plus, ArrowRight } from 'lucide-react-native';
import { Button } from './Button';

// Mock do hook useTheme
jest.mock('@/shared/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: {
        primary: '#111827',
        secondary: '#6B7280',
        disabled: '#9CA3AF',
        inverse: '#FFFFFF',
      },
      background: '#FFFFFF',
      surface: '#F9FAFB',
      border: '#E5E7EB',
    },
    theme: {
      colors: {
        primary: {
          DEFAULT: '#5843BE',
          500: '#5843BE',
        },
        secondary: {
          DEFAULT: '#3B82F6',
          500: '#3B82F6',
        },
      },
      spacing: {
        sm: 8,
        md: 16,
        lg: 24,
      },
      borderRadius: {
        md: 8,
        lg: 12,
      },
    },
    isDark: false,
    colorScheme: 'light' as const,
    isSystemTheme: false,
    setColorScheme: jest.fn(),
    toggleColorScheme: jest.fn(),
    setSystemTheme: jest.fn(),
  }),
}));

describe('Button Component', () => {
  describe('Renderização', () => {
    it('deve renderizar corretamente com props mínimas', () => {
      const { getByText } = render(
        <Button title="Clique aqui" onPress={() => {}} />
      );

      expect(getByText('Clique aqui')).toBeTruthy();
    });

    it('deve renderizar com variante primary por padrão', () => {
      const { getByText } = render(
        <Button title="Primary" onPress={() => {}} />
      );

      const button = getByText('Primary').parent?.parent;
      expect(button).toBeTruthy();
    });

    it('deve renderizar com todas as variantes', () => {
      const variants = ['primary', 'secondary', 'outline', 'ghost'] as const;

      variants.forEach((variant) => {
        const { getByText } = render(
          <Button title={variant} variant={variant} onPress={() => {}} />
        );
        expect(getByText(variant)).toBeTruthy();
      });
    });

    it('deve renderizar com todos os tamanhos', () => {
      const sizes = ['sm', 'md', 'lg'] as const;

      sizes.forEach((size) => {
        const { getByText } = render(
          <Button title={size} size={size} onPress={() => {}} />
        );
        expect(getByText(size)).toBeTruthy();
      });
    });
  });

  describe('Interação', () => {
    it('deve chamar onPress quando clicado', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <Button title="Clique" onPress={onPressMock} />
      );

      fireEvent.press(getByText('Clique'));
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('não deve chamar onPress quando disabled', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <Button title="Disabled" onPress={onPressMock} disabled />
      );

      fireEvent.press(getByText('Disabled'));
      expect(onPressMock).not.toHaveBeenCalled();
    });

    it('não deve chamar onPress quando loading', () => {
      const onPressMock = jest.fn();
      const { getByAccessibilityState } = render(
        <Button title="Loading" onPress={onPressMock} loading />
      );

      const button = getByAccessibilityState({ busy: true });
      fireEvent.press(button);
      expect(onPressMock).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('deve mostrar ActivityIndicator quando loading', () => {
      const { getByAccessibilityState, queryByText } = render(
        <Button title="Carregando" onPress={() => {}} loading />
      );

      expect(getByAccessibilityState({ busy: true })).toBeTruthy();
      expect(queryByText('Carregando')).toBeNull();
    });

    it('não deve mostrar texto quando loading', () => {
      const { queryByText } = render(
        <Button title="Texto" onPress={() => {}} loading />
      );

      expect(queryByText('Texto')).toBeNull();
    });
  });

  describe('Ícones', () => {
    it('deve renderizar ícone à esquerda', () => {
      const { getByText } = render(
        <Button title="Com ícone" onPress={() => {}} leftIcon={Plus} />
      );

      expect(getByText('Com ícone')).toBeTruthy();
    });

    it('deve renderizar ícone à direita', () => {
      const { getByText } = render(
        <Button title="Com ícone" onPress={() => {}} rightIcon={ArrowRight} />
      );

      expect(getByText('Com ícone')).toBeTruthy();
    });

    it('deve renderizar ambos os ícones', () => {
      const { getByText } = render(
        <Button
          title="Ambos"
          onPress={() => {}}
          leftIcon={Plus}
          rightIcon={ArrowRight}
        />
      );

      expect(getByText('Ambos')).toBeTruthy();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter accessibilityRole="button"', () => {
      const { getByRole } = render(
        <Button title="Acessível" onPress={() => {}} />
      );

      expect(getByRole('button')).toBeTruthy();
    });

    it('deve usar title como accessibilityLabel por padrão', () => {
      const { getByLabelText } = render(
        <Button title="Meu Botão" onPress={() => {}} />
      );

      expect(getByLabelText('Meu Botão')).toBeTruthy();
    });

    it('deve aceitar accessibilityLabel customizado', () => {
      const { getByLabelText } = render(
        <Button
          title="OK"
          onPress={() => {}}
          accessibilityLabel="Confirmar ação"
        />
      );

      expect(getByLabelText('Confirmar ação')).toBeTruthy();
    });

    it('deve indicar estado disabled na acessibilidade', () => {
      const { getByAccessibilityState } = render(
        <Button title="Disabled" onPress={() => {}} disabled />
      );

      expect(getByAccessibilityState({ disabled: true })).toBeTruthy();
    });

    it('deve indicar estado busy quando loading', () => {
      const { getByAccessibilityState } = render(
        <Button title="Loading" onPress={() => {}} loading />
      );

      expect(getByAccessibilityState({ busy: true })).toBeTruthy();
    });
  });

  describe('Classes customizadas', () => {
    it('deve aceitar className customizado', () => {
      const { getByText } = render(
        <Button title="Custom" onPress={() => {}} className="mb-4" />
      );

      expect(getByText('Custom')).toBeTruthy();
    });
  });

  describe('Props adicionais', () => {
    it('deve aceitar testID', () => {
      const { getByTestId } = render(
        <Button title="Test" onPress={() => {}} testID="my-button" />
      );

      expect(getByTestId('my-button')).toBeTruthy();
    });
  });
});
