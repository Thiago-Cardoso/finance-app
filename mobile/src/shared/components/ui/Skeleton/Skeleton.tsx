/**
 * Componente Skeleton
 *
 * Placeholder animado para conteúdo em carregamento.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, type ViewProps } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export interface SkeletonProps extends Omit<ViewProps, 'style'> {
  /**
   * Largura do skeleton
   * @default '100%'
   */
  width?: number | string;

  /**
   * Altura do skeleton
   * @default 16
   */
  height?: number;

  /**
   * Raio da borda
   * @default 4
   */
  borderRadius?: number;

  /**
   * Forma do skeleton
   * @default 'rect'
   */
  variant?: 'rect' | 'circle' | 'text';

  /**
   * Classes CSS adicionais (NativeWind)
   */
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius: customBorderRadius,
  variant = 'rect',
  className = '',
  ...rest
}: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  const getBorderRadius = () => {
    if (customBorderRadius !== undefined) return customBorderRadius;
    if (variant === 'circle') return 9999;
    if (variant === 'text') return 4;
    return 4;
  };

  const getWidth = () => {
    if (variant === 'circle') return height;
    return width;
  };

  return (
    <Animated.View
      className={className}
      style={{
        width: getWidth(),
        height,
        backgroundColor: colors.surface,
        borderRadius: getBorderRadius(),
        opacity,
      }}
      accessible={false}
      {...rest}
    />
  );
}
