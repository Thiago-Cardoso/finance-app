/**
 * View: About
 *
 * Screen showing app information, version, and credits.
 */

import React from 'react';
import { View, Text, TouchableOpacity, Linking, Image } from 'react-native';
import { Screen } from '@/shared/components/ui/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import Constants from 'expo-constants';
import {
  ArrowLeft,
  ExternalLink,
  Shield,
  FileText,
  Mail,
  Github,
  Heart,
} from 'lucide-react-native';

interface AboutViewProps {
  onGoBack: () => void;
}

export function AboutView({ onGoBack }: AboutViewProps) {
  const { colors, theme } = useTheme();

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || '1';
  const sdkVersion = Constants.expoConfig?.sdkVersion || '54.0.0';

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Error opening link:', err));
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
          Sobre o App
        </Text>
      </View>

      <View className="px-4 pt-8">
        {/* App Logo and Name */}
        <View className="items-center mb-8">
          <View
            className="w-24 h-24 rounded-3xl items-center justify-center mb-4"
            style={{ backgroundColor: theme.colors.primary.DEFAULT }}
          >
            <Text className="text-4xl">💰</Text>
          </View>
          <Text
            className="text-2xl font-bold mb-1"
            style={{ color: colors.text.primary }}
          >
            Finance App
          </Text>
          <Text
            className="text-sm"
            style={{ color: colors.text.secondary }}
          >
            Gerencie suas finanças com facilidade
          </Text>
        </View>

        {/* Version Info */}
        <View
          className="rounded-xl p-4 mb-6"
          style={{ backgroundColor: colors.surface }}
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text style={{ color: colors.text.secondary }}>Versão</Text>
            <Text
              className="font-medium"
              style={{ color: colors.text.primary }}
            >
              {appVersion}
            </Text>
          </View>
          <Divider color={colors.border} />
          <View className="flex-row justify-between items-center my-3">
            <Text style={{ color: colors.text.secondary }}>Build</Text>
            <Text
              className="font-medium"
              style={{ color: colors.text.primary }}
            >
              {buildNumber}
            </Text>
          </View>
          <Divider color={colors.border} />
          <View className="flex-row justify-between items-center mt-3">
            <Text style={{ color: colors.text.secondary }}>SDK Expo</Text>
            <Text
              className="font-medium"
              style={{ color: colors.text.primary }}
            >
              {sdkVersion}
            </Text>
          </View>
        </View>

        {/* Links Section */}
        <Text
          className="text-xs font-medium uppercase tracking-wider mb-2 px-2"
          style={{ color: colors.text.secondary }}
        >
          Links
        </Text>

        <View
          className="rounded-xl mb-6 overflow-hidden"
          style={{ backgroundColor: colors.surface }}
        >
          <LinkItem
            icon={Shield}
            label="Política de Privacidade"
            onPress={() => handleOpenLink('https://example.com/privacy')}
            colors={colors}
            theme={theme}
          />
          <Divider color={colors.border} />
          <LinkItem
            icon={FileText}
            label="Termos de Uso"
            onPress={() => handleOpenLink('https://example.com/terms')}
            colors={colors}
            theme={theme}
          />
          <Divider color={colors.border} />
          <LinkItem
            icon={Github}
            label="Código Fonte"
            onPress={() => handleOpenLink('https://github.com/Thiago-Cardoso/finance-app')}
            colors={colors}
            theme={theme}
          />
        </View>

        {/* Contact Section */}
        <Text
          className="text-xs font-medium uppercase tracking-wider mb-2 px-2"
          style={{ color: colors.text.secondary }}
        >
          Contato
        </Text>

        <View
          className="rounded-xl mb-6 overflow-hidden"
          style={{ backgroundColor: colors.surface }}
        >
          <LinkItem
            icon={Mail}
            label="Suporte"
            subtitle="contato@financeapp.com"
            onPress={() => handleOpenLink('mailto:contato@financeapp.com')}
            colors={colors}
            theme={theme}
          />
        </View>

        {/* Credits */}
        <View className="items-center py-8">
          <View className="flex-row items-center mb-2">
            <Text style={{ color: colors.text.secondary }}>Feito com </Text>
            <Heart size={14} color={theme.colors.error.DEFAULT} fill={theme.colors.error.DEFAULT} />
            <Text style={{ color: colors.text.secondary }}> por Thiago Cardoso</Text>
          </View>
          <Text
            className="text-xs"
            style={{ color: colors.text.disabled }}
          >
            2024 Finance App. Todos os direitos reservados.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

/**
 * Link Item Component
 */
interface LinkItemProps {
  icon: React.ElementType;
  label: string;
  subtitle?: string;
  onPress: () => void;
  colors: any;
  theme: any;
}

function LinkItem({ icon: Icon, label, subtitle, onPress, colors, theme }: LinkItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-4"
      activeOpacity={0.7}
    >
      <Icon size={22} color={colors.text.primary} />
      <View className="flex-1 ml-3">
        <Text
          className="text-base"
          style={{ color: colors.text.primary }}
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
      <ExternalLink size={18} color={colors.text.secondary} />
    </TouchableOpacity>
  );
}

/**
 * Divider Component
 */
function Divider({ color }: { color: string }) {
  return (
    <View
      className="h-px"
      style={{ backgroundColor: color }}
    />
  );
}

export default AboutView;
