/**
 * Componente Alert
 *
 * Mensagens de feedback com suporte a 4 variantes (success, error, warning, info).
 */

import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  /**
   * Variante do alert
   */
  variant: AlertVariant;

  /**
   * Título do alert
   */
  title?: string;

  /**
   * Mensagem do alert
   */
  message: string;

  /**
   * Classes CSS adicionais (NativeWind)
   */
  className?: string;
}

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export function Alert({ variant, title, message, className = '' }: AlertProps) {
  const { theme } = useTheme();

  const colors = {
    success: {
      bg: theme.colors.success[50],
      border: theme.colors.success.DEFAULT,
      text: theme.colors.success[700],
      icon: theme.colors.success.DEFAULT,
    },
    error: {
      bg: theme.colors.error[50],
      border: theme.colors.error.DEFAULT,
      text: theme.colors.error[700],
      icon: theme.colors.error.DEFAULT,
    },
    warning: {
      bg: theme.colors.warning[50],
      border: theme.colors.warning.DEFAULT,
      text: theme.colors.warning[700],
      icon: theme.colors.warning.DEFAULT,
    },
    info: {
      bg: theme.colors.info[50],
      border: theme.colors.info.DEFAULT,
      text: theme.colors.info[700],
      icon: theme.colors.info.DEFAULT,
    },
  };

  const Icon = ICONS[variant];
  const variantColors = colors[variant];

  return (
    <View
      className={`flex-row items-start p-4 rounded-lg ${className}`}
      style={{
        backgroundColor: variantColors.bg,
        borderLeftWidth: 4,
        borderLeftColor: variantColors.border,
      }}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Icon
        size={20}
        color={variantColors.icon}
        style={{ marginTop: 2, marginRight: 12 }}
      />

      <View className="flex-1">
        {title && (
          <Text
            className="text-base font-semibold mb-1"
            style={{ color: variantColors.text }}
          >
            {title}
          </Text>
        )}
        <Text className="text-sm" style={{ color: variantColors.text }}>
          {message}
        </Text>
      </View>
    </View>
  );
}
