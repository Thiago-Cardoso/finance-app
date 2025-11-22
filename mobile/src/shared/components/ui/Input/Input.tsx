/**
 * Componente Input
 *
 * Campo de texto acessível e customizável com suporte a:
 * - Validação e mensagens de erro
 * - Ícones (Lucide)
 * - Estados focus/disabled
 * - Password toggle
 * - Acessibilidade WCAG AA
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import type { InputProps } from './types';

export function Input({
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  required = false,
  disabled = false,
  secureTextEntry = false,
  containerClassName = '',
  className = '',
  accessibilityLabel,
  ...rest
}: InputProps) {
  const { colors, theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const hasError = Boolean(error);
  const showPasswordToggle = secureTextEntry;

  // Cores dinâmicas baseadas no estado
  const borderColor = hasError
    ? theme.colors.error.DEFAULT
    : isFocused
    ? theme.colors.primary.DEFAULT
    : colors.border;

  const iconColor = hasError
    ? theme.colors.error.DEFAULT
    : isFocused
    ? theme.colors.primary.DEFAULT
    : colors.text.secondary;

  return (
    <View
      className={containerClassName}
      accessible={false} // Delegamos acessibilidade ao TextInput
    >
      {/* Label */}
      {label && (
        <Text
          className="text-sm font-medium mb-2"
          style={{ color: colors.text.primary }}
        >
          {label}
          {required && <Text className="text-error"> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View
        className={`
          flex-row items-center
          px-4 py-3 rounded-lg
          ${disabled ? 'opacity-50' : 'opacity-100'}
        `}
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor,
        }}
      >
        {/* Left Icon */}
        {LeftIcon && (
          <View className="mr-2">
            <LeftIcon
              size={20}
              color={iconColor}
            />
          </View>
        )}

        {/* Text Input */}
        <TextInput
          className={`
            flex-1 text-base
            ${className}
          `}
          style={{ color: colors.text.primary }}
          placeholderTextColor={colors.text.disabled}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessible={true}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={helperText}
          accessibilityState={{
            disabled,
          }}
          accessibilityValue={
            hasError ? { text: `Erro: ${error}` } : undefined
          }
          {...rest}
        />

        {/* Right Icon ou Password Toggle */}
        {showPasswordToggle ? (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            className="ml-2"
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            accessible={true}
            accessibilityLabel={
              isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'
            }
            accessibilityRole="button"
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={iconColor} />
            ) : (
              <Eye size={20} color={iconColor} />
            )}
          </TouchableOpacity>
        ) : RightIcon ? (
          <View className="ml-2">
            <RightIcon
              size={20}
              color={iconColor}
            />
          </View>
        ) : null}
      </View>

      {/* Error Message */}
      {error && (
        <Text
          className="text-sm mt-1"
          style={{ color: theme.colors.error.DEFAULT }}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}

      {/* Helper Text */}
      {!error && helperText && (
        <Text
          className="text-sm mt-1"
          style={{ color: colors.text.secondary }}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
}
