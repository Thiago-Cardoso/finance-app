/**
 * View: Profile
 *
 * Tela de perfil do usuário com configurações.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Tag, ChevronRight, LogOut, User as UserIcon } from 'lucide-react-native';
import { Screen } from '@/shared/components/ui/Screen';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/hooks/useTheme';
import { useAuthViewModel } from '@/viewModels/useAuth.viewModel';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

function MenuItem({ icon, title, subtitle, onPress }: MenuItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center p-4 rounded-xl mb-2"
      style={{ backgroundColor: colors.background.secondary }}
    >
      <View className="mr-3">{icon}</View>
      <View className="flex-1">
        <Text className="text-base font-medium" style={{ color: colors.text.primary }}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm" style={{ color: colors.text.tertiary }}>
            {subtitle}
          </Text>
        )}
      </View>
      <ChevronRight size={20} color={colors.text.tertiary} />
    </TouchableOpacity>
  );
}

export function ProfileView() {
  const { colors, theme } = useTheme();
  const { handleSignOut, user } = useAuthViewModel();
  const navigation = useNavigation();

  return (
    <Screen title="Perfil" scrollable>
      <View className="flex-1 px-4 py-6">
        {/* User Info */}
        <View
          className="items-center p-6 rounded-xl mb-6"
          style={{ backgroundColor: colors.background.secondary }}
        >
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: theme.colors.primary.DEFAULT + '20' }}
          >
            <UserIcon size={40} color={theme.colors.primary.DEFAULT} />
          </View>
          <Text className="text-xl font-bold mb-1" style={{ color: colors.text.primary }}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text className="text-base" style={{ color: colors.text.secondary }}>
            {user?.email}
          </Text>
        </View>

        {/* Menu Items */}
        <Text className="text-sm font-semibold mb-2 px-1" style={{ color: colors.text.tertiary }}>
          CONFIGURAÇÕES
        </Text>

        <MenuItem
          icon={<Tag size={22} color={theme.colors.primary.DEFAULT} />}
          title="Categorias"
          subtitle="Gerenciar categorias de transações"
          onPress={() => navigation.navigate('CategoryList')}
        />

        {/* Logout */}
        <View className="mt-6">
          <Button
            title="Sair da Conta"
            onPress={handleSignOut}
            variant="outline"
            leftIcon={LogOut}
          />
        </View>
      </View>
    </Screen>
  );
}
