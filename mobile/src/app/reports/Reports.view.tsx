/**
 * View: Reports
 *
 * Tela de relatórios (placeholder).
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Screen } from '@/shared/components/ui/Screen';
import { useTheme } from '@/shared/hooks/useTheme';

export function ReportsView() {
  const { colors } = useTheme();

  return (
    <Screen title="Relatórios" scrollable>
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-2xl font-bold mb-2" style={{ color: colors.text.primary }}>
          Relatórios
        </Text>
        <Text className="text-base text-center" style={{ color: colors.text.secondary }}>
          Implementação em desenvolvimento...
        </Text>
      </View>
    </Screen>
  );
}
