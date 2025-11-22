/**
 * View: Profile
 *
 * Tela de perfil do usuário (placeholder).
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Screen } from '@/shared/components/ui/Screen';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/hooks/useTheme';
import { useAuthViewModel } from '@/viewModels/useAuth.viewModel';

export function ProfileView() {
  const { colors } = useTheme();
  const { handleSignOut, user } = useAuthViewModel();

  return (
    <Screen title="Perfil" scrollable>
      <View className="flex-1 p-6">
        <View className="items-center mb-6">
          <Text className="text-2xl font-bold mb-2" style={{ color: colors.text.primary }}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text className="text-base" style={{ color: colors.text.secondary }}>
            {user?.email}
          </Text>
        </View>

        <Text className="text-base text-center mb-6" style={{ color: colors.text.secondary }}>
          Configurações e detalhes do perfil em desenvolvimento...
        </Text>

        <Button
          title="Sair"
          onPress={handleSignOut}
          variant="outline"
        />
      </View>
    </Screen>
  );
}
