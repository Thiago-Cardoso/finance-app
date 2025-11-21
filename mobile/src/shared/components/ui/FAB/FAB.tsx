/**
 * Componente FAB (Floating Action Button)
 *
 * Botão flutuante de ação principal, posicionado no canto inferior direito.
 */

import React from 'react';
import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export interface FABProps extends Omit<TouchableOpacityProps, 'children'> {
  /**
   * Função chamada ao pressionar
   */
  onPress: () => void;

  /**
   * Ícone (componente Lucide)
   * @default Plus
   */
  icon?: LucideIcon;

  /**
   * Tamanho do FAB
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Posição do FAB
   * @default 'bottom-right'
   */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';

  /**
   * Distância da borda (em pixels)
   * @default 16
   */
  offset?: number;

  /**
   * Label acessível
   */
  accessibilityLabel?: string;
}

export function FAB({
  onPress,
  icon: Icon = Plus,
  size = 'md',
  position = 'bottom-right',
  offset = 16,
  accessibilityLabel = 'Ação principal',
  ...rest
}: FABProps) {
  const { theme } = useTheme();

  const sizes = {
    sm: {
      container: 48,
      icon: 20,
    },
    md: {
      container: 56,
      icon: 24,
    },
    lg: {
      container: 64,
      icon: 28,
    },
  };

  const positions = {
    'bottom-right': {
      bottom: offset,
      right: offset,
    },
    'bottom-left': {
      bottom: offset,
      left: offset,
    },
    'bottom-center': {
      bottom: offset,
      left: '50%',
      marginLeft: -(sizes[size].container / 2),
    },
  };

  const selectedSize = sizes[size];
  const selectedPosition = positions[position];

  return (
    <TouchableOpacity
      onPress={onPress}
      className="absolute items-center justify-center"
      style={{
        width: selectedSize.container,
        height: selectedSize.container,
        borderRadius: selectedSize.container / 2,
        backgroundColor: theme.colors.primary.DEFAULT,
        ...selectedPosition,
        ...theme.shadows.lg,
      }}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint="Toque para executar a ação principal"
      {...rest}
    >
      <Icon size={selectedSize.icon} color="#FFFFFF" />
    </TouchableOpacity>
  );
}
