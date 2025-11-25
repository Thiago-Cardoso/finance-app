/**
 * View: Profile
 *
 * Main profile screen with user info and navigation options.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
  User,
  Settings,
  Lock,
  Info,
  LogOut,
  ChevronRight,
  Mail,
  Tag,
} from 'lucide-react-native';
import { Screen } from '@/shared/components/ui/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { useProfileViewModel } from '@/viewModels/useProfile.viewModel';
import Constants from 'expo-constants';

interface ProfileViewProps {
  onNavigateToEditProfile: () => void;
  onNavigateToSettings: () => void;
  onNavigateToChangePassword: () => void;
  onNavigateToAbout: () => void;
  onNavigateToCategories: () => void;
}

export function ProfileView({
  onNavigateToEditProfile,
  onNavigateToSettings,
  onNavigateToChangePassword,
  onNavigateToAbout,
  onNavigateToCategories,
}: ProfileViewProps) {
  const { colors, theme } = useTheme();
  const {
    user,
    getUserInitials,
    getFullName,
    confirmLogout,
  } = useProfileViewModel();

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <Screen title="Perfil" showHeader scrollable={false}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Header */}
        <View className="items-center pt-6 pb-8">
          {/* Avatar */}
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: theme.colors.primary.DEFAULT }}
          >
            <Text className="text-3xl font-bold text-white">
              {getUserInitials()}
            </Text>
          </View>

          {/* Name */}
          <Text
            className="text-xl font-bold mb-1"
            style={{ color: colors.text.primary }}
          >
            {getFullName()}
          </Text>

          {/* Email */}
          <View className="flex-row items-center">
            <Mail size={14} color={colors.text.secondary} />
            <Text
              className="text-sm ml-1"
              style={{ color: colors.text.secondary }}
            >
              {user?.email}
            </Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View className="px-4">
          {/* Account Section */}
          <Text
            className="text-xs font-medium uppercase tracking-wider mb-2 px-2"
            style={{ color: colors.text.secondary }}
          >
            Conta
          </Text>

          <View
            className="rounded-xl mb-6 overflow-hidden"
            style={{ backgroundColor: colors.surface }}
          >
            <MenuItem
              icon={User}
              label="Editar Perfil"
              onPress={onNavigateToEditProfile}
              colors={colors}
              theme={theme}
            />
            <Divider color={colors.border} />
            <MenuItem
              icon={Lock}
              label="Alterar Senha"
              onPress={onNavigateToChangePassword}
              colors={colors}
              theme={theme}
            />
          </View>

          {/* Preferences Section */}
          <Text
            className="text-xs font-medium uppercase tracking-wider mb-2 px-2"
            style={{ color: colors.text.secondary }}
          >
            Preferências
          </Text>

          <View
            className="rounded-xl mb-6 overflow-hidden"
            style={{ backgroundColor: colors.surface }}
          >
            <MenuItem
              icon={Settings}
              label="Configurações"
              onPress={onNavigateToSettings}
              colors={colors}
              theme={theme}
            />
            <Divider color={colors.border} />
            <MenuItem
              icon={Tag}
              label="Categorias"
              subtitle="Gerenciar categorias"
              onPress={onNavigateToCategories}
              colors={colors}
              theme={theme}
            />
          </View>

          {/* Info Section */}
          <Text
            className="text-xs font-medium uppercase tracking-wider mb-2 px-2"
            style={{ color: colors.text.secondary }}
          >
            Informações
          </Text>

          <View
            className="rounded-xl mb-6 overflow-hidden"
            style={{ backgroundColor: colors.surface }}
          >
            <MenuItem
              icon={Info}
              label="Sobre o App"
              onPress={onNavigateToAbout}
              colors={colors}
              theme={theme}
            />
          </View>

          {/* Logout Section */}
          <View
            className="rounded-xl mb-6 overflow-hidden"
            style={{ backgroundColor: colors.surface }}
          >
            <MenuItem
              icon={LogOut}
              label="Sair"
              onPress={confirmLogout}
              colors={colors}
              theme={theme}
              destructive
            />
          </View>

          {/* App Version */}
          <Text
            className="text-center text-xs mt-4"
            style={{ color: colors.text.disabled }}
          >
            Versão {appVersion}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

/**
 * Menu Item Component
 */
interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  subtitle?: string;
  onPress: () => void;
  colors: any;
  theme: any;
  destructive?: boolean;
}

function MenuItem({
  icon: Icon,
  label,
  subtitle,
  onPress,
  colors,
  theme,
  destructive = false,
}: MenuItemProps) {
  const iconColor = destructive ? theme.colors.error.DEFAULT : colors.text.primary;
  const labelColor = destructive ? theme.colors.error.DEFAULT : colors.text.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-4"
      activeOpacity={0.7}
    >
      <Icon size={22} color={iconColor} />
      <View className="flex-1 ml-3">
        <Text
          className="text-base"
          style={{ color: labelColor }}
        >
          {label}
        </Text>
        {subtitle && (
          <Text
            className="text-xs mt-0.5"
            style={{ color: colors.text.secondary }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <ChevronRight size={20} color={colors.text.secondary} />
    </TouchableOpacity>
  );
}

/**
 * Divider Component
 */
function Divider({ color }: { color: string }) {
  return (
    <View
      className="h-px ml-14"
      style={{ backgroundColor: color }}
    />
  );
}

export default ProfileView;
