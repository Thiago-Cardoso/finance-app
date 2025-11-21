/**
 * Componente Card
 *
 * Container reutilizável com sombras e suporte a temas.
 * - Sombras responsivas
 * - Suporte a tema claro/escuro
 * - Pressable opcional para interação
 */

import React from 'react';
import { View, Pressable, type ViewProps, type PressableProps } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export interface CardProps extends Omit<ViewProps, 'style'> {
  /**
   * Conteúdo do card
   */
  children: React.ReactNode;

  /**
   * Se o card é interativo (pressable)
   * @default false
   */
  pressable?: boolean;

  /**
   * Função chamada ao pressionar (requer pressable=true)
   */
  onPress?: () => void;

  /**
   * Variante de sombra
   * @default 'md'
   */
  shadow?: 'sm' | 'md' | 'lg' | 'none';

  /**
   * Padding interno
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';

  /**
   * Classes CSS adicionais (NativeWind)
   */
  className?: string;

  /**
   * Props adicionais do Pressable (quando pressable=true)
   */
  pressableProps?: Omit<PressableProps, 'onPress' | 'children'>;
}

export function Card({
  children,
  pressable = false,
  onPress,
  shadow = 'md',
  padding = 'md',
  className = '',
  pressableProps,
  ...rest
}: CardProps) {
  const { colors, theme } = useTheme();

  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  const shadowStyle = shadow !== 'none' ? theme.shadows[shadow] : undefined;

  const cardStyle = {
    backgroundColor: colors.background,
    ...shadowStyle,
  };

  const baseClassName = `
    rounded-lg
    ${paddingClasses[padding]}
    ${className}
  `;

  if (pressable && onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={baseClassName}
        style={({ pressed }) => [
          cardStyle,
          {
            opacity: pressed ? 0.7 : 1,
            backgroundColor: pressed ? colors.surfaceHover : colors.background,
          },
        ]}
        accessible={true}
        accessibilityRole="button"
        {...pressableProps}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={baseClassName} style={cardStyle} {...rest}>
      {children}
    </View>
  );
}
