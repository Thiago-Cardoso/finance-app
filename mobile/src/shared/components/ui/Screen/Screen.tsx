/**
 * Componente Screen
 *
 * Wrapper de tela com SafeArea, header customizável e scroll opcional.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  type ScrollViewProps,
  type ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export interface ScreenProps {
  /**
   * Conteúdo da tela
   */
  children: React.ReactNode;

  /**
   * Ativar scroll
   * @default true
   */
  scrollable?: boolean;

  /**
   * Mostrar header
   * @default true
   */
  showHeader?: boolean;

  /**
   * Título do header
   */
  title?: string;

  /**
   * Mostrar botão de voltar
   * @default false
   */
  showBackButton?: boolean;

  /**
   * Callback ao pressionar voltar
   */
  onBack?: () => void;

  /**
   * Componente customizado para o header (direita)
   */
  headerRight?: React.ReactNode;

  /**
   * Classes CSS adicionais do container (NativeWind)
   */
  className?: string;

  /**
   * Props adicionais do ScrollView (quando scrollable=true)
   */
  scrollViewProps?: Omit<ScrollViewProps, 'children'>;

  /**
   * Props adicionais da View (quando scrollable=false)
   */
  viewProps?: ViewProps;
}

export function Screen({
  children,
  scrollable = true,
  showHeader = true,
  title,
  showBackButton = false,
  onBack,
  headerRight,
  className = '',
  scrollViewProps,
  viewProps,
}: ScreenProps) {
  const { colors } = useTheme();

  const Container = scrollable ? ScrollView : View;
  const containerProps = scrollable ? scrollViewProps : viewProps;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={['top']}
    >
      {/* Header */}
      {showHeader && (
        <View
          className="flex-row items-center justify-between px-4 py-3"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: colors.divider,
          }}
        >
          {/* Left: Back Button ou Spacer */}
          {showBackButton && onBack ? (
            <TouchableOpacity
              onPress={onBack}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              accessible={true}
              accessibilityLabel="Voltar"
              accessibilityRole="button"
              accessibilityHint="Volta para a tela anterior"
            >
              <ArrowLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}

          {/* Center: Title */}
          {title && (
            <Text
              className="text-lg font-semibold flex-1 text-center"
              style={{ color: colors.text.primary }}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}

          {/* Right: Custom Component ou Spacer */}
          {headerRight || <View style={{ width: 24 }} />}
        </View>
      )}

      {/* Content */}
      <Container
        className={`flex-1 ${className}`}
        {...(containerProps as any)}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}
