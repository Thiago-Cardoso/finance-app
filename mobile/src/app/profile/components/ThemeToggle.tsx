/**
 * Component: ThemeToggle
 *
 * Toggle para alternar entre temas (claro/escuro/sistema).
 * Usado na tela de configurações (Settings.view).
 *
 * ANTI-LOOP PATTERN:
 * - Acessa apenas funções do store (não estado reativo desnecessário)
 * - useCallback para handlers estáveis
 * - Sem estados locais
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Sun, Moon, Monitor } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import type { ThemePreference } from '@/shared/stores/themeStore';

export interface ThemeToggleProps {
  /**
   * Custom className for container
   */
  className?: string;
}

/**
 * ThemeToggle Component
 *
 * Permite ao usuário escolher entre tema claro, escuro ou seguir o sistema.
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { colors, theme, themePreference, setColorScheme } = useTheme();

  const handleThemeChange = useCallback(
    (preference: ThemePreference) => {
      setColorScheme(preference);
    },
    [setColorScheme]
  );

  const options = [
    {
      value: 'light' as ThemePreference,
      label: 'Claro',
      icon: Sun,
    },
    {
      value: 'dark' as ThemePreference,
      label: 'Escuro',
      icon: Moon,
    },
    {
      value: 'system' as ThemePreference,
      label: 'Sistema',
      icon: Monitor,
    },
  ];

  return (
    <View className={`${className}`}>
      <Text
        className="text-sm font-medium mb-3"
        style={{ color: colors.text.secondary }}
      >
        Tema do Aplicativo
      </Text>

      <View className="flex-row gap-3">
        {options.map((option) => {
          const isActive = themePreference === option.value;
          const Icon = option.icon;

          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => handleThemeChange(option.value)}
              className="flex-1 py-4 px-3 rounded-xl items-center"
              style={{
                backgroundColor: isActive
                  ? `${theme.colors.primary.DEFAULT}20`
                  : colors.surface,
                borderWidth: isActive ? 2 : 1,
                borderColor: isActive
                  ? theme.colors.primary.DEFAULT
                  : colors.border,
              }}
              accessibilityRole="button"
              accessibilityLabel={`Tema ${option.label}`}
              accessibilityState={{ selected: isActive }}
            >
              <Icon
                size={24}
                color={
                  isActive ? theme.colors.primary.DEFAULT : colors.text.secondary
                }
              />
              <Text
                className="text-xs font-medium mt-2"
                style={{
                  color: isActive
                    ? theme.colors.primary.DEFAULT
                    : colors.text.secondary,
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Helper text */}
      <Text
        className="text-xs mt-3"
        style={{ color: colors.text.disabled }}
      >
        {themePreference === 'system'
          ? 'O tema seguirá as configurações do seu dispositivo'
          : `Tema ${themePreference === 'dark' ? 'escuro' : 'claro'} ativado`}
      </Text>
    </View>
  );
}

export default ThemeToggle;
