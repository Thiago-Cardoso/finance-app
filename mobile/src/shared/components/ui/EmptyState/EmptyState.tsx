/**
 * Componente EmptyState
 *
 * Estado vazio com ícone, título e descrição.
 */

import React from 'react';
import { View, Text } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { Button, type ButtonProps } from '../Button';

export interface EmptyStateProps {
  /**
   * Ícone (componente Lucide)
   */
  icon: LucideIcon;

  /**
   * Título
   */
  title: string;

  /**
   * Descrição
   */
  description?: string;

  /**
   * Ação primária (botão)
   */
  action?: {
    label: string;
    onPress: () => void;
  } & Partial<ButtonProps>;

  /**
   * Classes CSS adicionais (NativeWind)
   */
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View
      className={`flex-1 items-center justify-center px-8 ${className}`}
      accessible={true}
      accessibilityRole="text"
    >
      <Icon
        size={64}
        color={colors.text.disabled}
        strokeWidth={1.5}
      />

      <Text
        className="text-xl font-bold mt-4 text-center"
        style={{ color: colors.text.primary }}
      >
        {title}
      </Text>

      {description && (
        <Text
          className="text-base mt-2 text-center"
          style={{ color: colors.text.secondary }}
        >
          {description}
        </Text>
      )}

      {action && (
        <Button
          title={action.label}
          onPress={action.onPress}
          className="mt-6"
          {...action}
        />
      )}
    </View>
  );
}
