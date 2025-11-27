/**
 * View: Settings
 *
 * Screen for app settings including theme and notifications.
 *
 * ANTI-LOOP PATTERN:
 * - Loads theme preference once on mount
 * - Uses stable ThemeStore actions
 * - No useState for theme management
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Screen } from '@/shared/components/ui/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { useThemeStore, type ThemePreference } from '@/shared/stores/themeStore';
import {
  ArrowLeft,
  Sun,
  Moon,
  Smartphone,
  Bell,
  BellOff,
  Check,
} from 'lucide-react-native';

interface SettingsViewProps {
  onGoBack: () => void;
}

export function SettingsView({ onGoBack }: SettingsViewProps) {
  const {
    colors,
    theme,
    themePreference,
  } = useTheme();

  const { setThemePreference, loadThemePreference } = useThemeStore();

  // Load theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, [loadThemePreference]);

  const handleThemeChange = (option: ThemePreference) => {
    setThemePreference(option);
  };

  return (
    <Screen showHeader={false} scrollable>
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <TouchableOpacity
          onPress={onGoBack}
          className="p-2 -ml-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text
          className="text-lg font-semibold ml-2"
          style={{ color: colors.text.primary }}
        >
          Configurações
        </Text>
      </View>

      <View className="px-4 pt-6">
        {/* Theme Section */}
        <Text
          className="text-xs font-medium uppercase tracking-wider mb-2 px-2"
          style={{ color: colors.text.secondary }}
        >
          Aparência
        </Text>

        <View
          className="rounded-xl mb-6 overflow-hidden"
          style={{ backgroundColor: colors.surface }}
        >
          <ThemeOptionItem
            icon={Sun}
            label="Claro"
            description="Sempre usar tema claro"
            isSelected={themePreference === 'light'}
            onPress={() => handleThemeChange('light')}
            colors={colors}
            theme={theme}
          />
          <Divider color={colors.border} />
          <ThemeOptionItem
            icon={Moon}
            label="Escuro"
            description="Sempre usar tema escuro"
            isSelected={themePreference === 'dark'}
            onPress={() => handleThemeChange('dark')}
            colors={colors}
            theme={theme}
          />
          <Divider color={colors.border} />
          <ThemeOptionItem
            icon={Smartphone}
            label="Automático"
            description="Seguir configuração do sistema"
            isSelected={themePreference === 'system'}
            onPress={() => handleThemeChange('system')}
            colors={colors}
            theme={theme}
          />
        </View>

        {/* Notifications Section */}
        <Text
          className="text-xs font-medium uppercase tracking-wider mb-2 px-2"
          style={{ color: colors.text.secondary }}
        >
          Notificações
        </Text>

        <View
          className="rounded-xl mb-6 overflow-hidden"
          style={{ backgroundColor: colors.surface }}
        >
          <NotificationItem
            icon={Bell}
            label="Notificações Push"
            description="Receber alertas de transações"
            enabled={true}
            onToggle={() => {}}
            colors={colors}
            theme={theme}
          />
          <Divider color={colors.border} />
          <NotificationItem
            icon={BellOff}
            label="Lembretes de Orçamento"
            description="Alertar quando atingir limite"
            enabled={false}
            onToggle={() => {}}
            colors={colors}
            theme={theme}
          />
        </View>

        {/* Info */}
        <View
          className="p-4 rounded-lg"
          style={{ backgroundColor: `${theme.colors.primary.DEFAULT}10` }}
        >
          <Text
            className="text-sm"
            style={{ color: colors.text.secondary }}
          >
            As configurações de notificações estarão disponíveis em uma próxima versão.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

/**
 * Theme Option Item
 */
interface ThemeOptionItemProps {
  icon: React.ElementType;
  label: string;
  description: string;
  isSelected: boolean;
  onPress: () => void;
  colors: any;
  theme: any;
}

function ThemeOptionItem({
  icon: Icon,
  label,
  description,
  isSelected,
  onPress,
  colors,
  theme,
}: ThemeOptionItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-4"
      activeOpacity={0.7}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{
          backgroundColor: isSelected
            ? `${theme.colors.primary.DEFAULT}20`
            : colors.background,
        }}
      >
        <Icon
          size={20}
          color={isSelected ? theme.colors.primary.DEFAULT : colors.text.secondary}
        />
      </View>
      <View className="flex-1 ml-3">
        <Text
          className="text-base"
          style={{ color: colors.text.primary }}
        >
          {label}
        </Text>
        <Text
          className="text-xs mt-0.5"
          style={{ color: colors.text.secondary }}
        >
          {description}
        </Text>
      </View>
      {isSelected && (
        <Check size={20} color={theme.colors.primary.DEFAULT} />
      )}
    </TouchableOpacity>
  );
}

/**
 * Notification Item with Toggle
 */
interface NotificationItemProps {
  icon: React.ElementType;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  colors: any;
  theme: any;
}

function NotificationItem({
  icon: Icon,
  label,
  description,
  enabled,
  onToggle,
  colors,
  theme,
}: NotificationItemProps) {
  return (
    <View className="flex-row items-center px-4 py-4">
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <Icon size={20} color={colors.text.secondary} />
      </View>
      <View className="flex-1 ml-3">
        <Text
          className="text-base"
          style={{ color: colors.text.primary }}
        >
          {label}
        </Text>
        <Text
          className="text-xs mt-0.5"
          style={{ color: colors.text.secondary }}
        >
          {description}
        </Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{
          false: colors.border,
          true: `${theme.colors.primary.DEFAULT}80`,
        }}
        thumbColor={enabled ? theme.colors.primary.DEFAULT : colors.surface}
        disabled
      />
    </View>
  );
}

/**
 * Divider Component
 */
function Divider({ color }: { color: string }) {
  return (
    <View
      className="h-px ml-16"
      style={{ backgroundColor: color }}
    />
  );
}

export default SettingsView;
