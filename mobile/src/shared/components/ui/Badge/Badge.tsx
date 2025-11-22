/**
 * Componente Badge
 *
 * Indicador visual pequeno com cores temáticas.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /**
   * Texto do badge
   */
  label: string;

  /**
   * Variante de cor
   * @default 'default'
   */
  variant?: BadgeVariant;

  /**
   * Tamanho do badge
   * @default 'md'
   */
  size?: BadgeSize;

  /**
   * Classes CSS adicionais (NativeWind)
   */
  className?: string;
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  const { theme, colors } = useTheme();

  const variantColors = {
    default: {
      bg: colors.surface,
      text: colors.text.primary,
    },
    success: {
      bg: theme.colors.success[100],
      text: theme.colors.success[700],
    },
    error: {
      bg: theme.colors.error[100],
      text: theme.colors.error[700],
    },
    warning: {
      bg: theme.colors.warning[100],
      text: theme.colors.warning[700],
    },
    info: {
      bg: theme.colors.info[100],
      text: theme.colors.info[700],
    },
  };

  const sizeClasses = {
    sm: { padding: 'px-2 py-1', text: 'text-xs' },
    md: { padding: 'px-3 py-1', text: 'text-sm' },
    lg: { padding: 'px-4 py-2', text: 'text-base' },
  };

  const selectedColors = variantColors[variant];
  const selectedSize = sizeClasses[size];

  return (
    <View
      className={`rounded-full ${selectedSize.padding} ${className}`}
      style={{ backgroundColor: selectedColors.bg }}
      accessible={true}
      accessibilityLabel={label}
      accessibilityRole="text"
    >
      <Text
        className={`${selectedSize.text} font-medium`}
        style={{ color: selectedColors.text }}
      >
        {label}
      </Text>
    </View>
  );
}
