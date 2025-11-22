/**
 * Componente Button
 *
 * Botão acessível e customizável com suporte a:
 * - 4 variantes (primary, secondary, outline, ghost)
 * - 3 tamanhos (sm, md, lg)
 * - Loading state
 * - Ícones (Lucide)
 * - Acessibilidade WCAG AA
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import type { ButtonProps } from './types';

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const { colors, theme } = useTheme();

  // Estados
  const isDisabled = disabled || loading;

  // Classes base
  const baseClasses = 'rounded-lg items-center justify-center flex-row';

  // Classes por variante
  const variantClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    outline: 'border-2 border-primary bg-transparent',
    ghost: 'bg-transparent',
  };

  // Classes por tamanho (considerando tamanhos mínimos de toque)
  const sizeClasses = {
    sm: 'py-2 px-4 min-h-[44px]', // iOS min touch target
    md: 'py-3 px-6 min-h-[48px]', // Android min touch target
    lg: 'py-4 px-8 min-h-[48px]',
  };

  // Cores do texto por variante
  const textColors = {
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    outline: theme.colors.primary.DEFAULT,
    ghost: colors.text.primary,
  };

  // Tamanhos de texto
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // Tamanho dos ícones
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  // Cor do ActivityIndicator
  const loaderColors = {
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    outline: theme.colors.primary.DEFAULT,
    ghost: colors.text.primary,
  };

  // Cores de fundo por variante (fallback para inline styles)
  const backgroundColors = {
    primary: theme.colors.primary.DEFAULT,
    secondary: theme.colors.secondary.DEFAULT,
    outline: 'transparent',
    ghost: 'transparent',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50' : 'opacity-100'}
        ${className}
      `}
      style={{
        backgroundColor: backgroundColors[variant],
        borderColor: variant === 'outline' ? theme.colors.primary.DEFAULT : undefined,
        borderWidth: variant === 'outline' ? 2 : 0,
      }}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          color={loaderColors[variant]} 
          size="small" 
          testID="button-loading"
          accessibilityLabel="Loading"
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {LeftIcon && (
            <LeftIcon
              size={iconSizes[size]}
              color={textColors[variant]}
            />
          )}

          <Text
            className={`
              font-semibold
              ${textSizeClasses[size]}
            `}
            style={{ color: textColors[variant] }}
          >
            {title}
          </Text>

          {RightIcon && (
            <RightIcon
              size={iconSizes[size]}
              color={textColors[variant]}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}
