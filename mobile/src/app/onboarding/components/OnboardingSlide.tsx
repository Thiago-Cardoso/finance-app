/**
 * Component: OnboardingSlide
 *
 * Slide individual para o fluxo de onboarding com animações.
 */

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useTheme } from '@/shared/hooks/useTheme';
import type { LucideIcon } from 'lucide-react-native';

interface OnboardingSlideProps {
  /**
   * Ícone do Lucide para o slide
   */
  Icon: LucideIcon;

  /**
   * Cor do ícone
   */
  iconColor?: string;

  /**
   * Título do slide
   */
  title: string;

  /**
   * Descrição do slide
   */
  description: string;

  /**
   * Indica se o slide está ativo (para animações)
   */
  isActive?: boolean;
}

/**
 * Slide individual do onboarding
 */
export function OnboardingSlide({
  Icon,
  iconColor,
  title,
  description,
  isActive = false,
}: OnboardingSlideProps) {
  const { colors, theme } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  // Animação quando o slide se torna ativo
  useEffect(() => {
    if (isActive) {
      opacity.value = withTiming(1, { duration: 600 });
      translateY.value = withDelay(100, withTiming(0, { duration: 600 }));
    } else {
      opacity.value = 0;
      translateY.value = 30;
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const defaultIconColor = iconColor || theme.colors.primary.DEFAULT;

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Animated.View style={animatedStyle} className="items-center">
        {/* Ícone */}
        <View
          className="w-32 h-32 rounded-full items-center justify-center mb-8"
          style={{ backgroundColor: `${defaultIconColor}15` }}
        >
          <Icon size={64} color={defaultIconColor} />
        </View>

        {/* Título */}
        <Text
          className="text-3xl font-bold text-center mb-4"
          style={{ color: colors.text.primary }}
        >
          {title}
        </Text>

        {/* Descrição */}
        <Text
          className="text-base text-center leading-6"
          style={{ color: colors.text.secondary }}
        >
          {description}
        </Text>
      </Animated.View>
    </View>
  );
}
