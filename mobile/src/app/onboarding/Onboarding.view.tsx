/**
 * View: Onboarding
 *
 * Tela de onboarding com 3 slides explicando as funcionalidades principais.
 * Suporta swipe horizontal, opção de pular e navegação para configuração inicial.
 */

import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LayoutDashboard, TrendingUp, PieChart } from 'lucide-react-native';
import { OnboardingSlide } from './components/OnboardingSlide';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/hooks/useTheme';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  icon: typeof LayoutDashboard;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    id: '1',
    icon: LayoutDashboard,
    title: 'Controle suas finanças',
    description:
      'Tenha uma visão completa das suas receitas, despesas e saldo em tempo real no dashboard.',
  },
  {
    id: '2',
    icon: TrendingUp,
    title: 'Registre transações rapidamente',
    description:
      'Adicione receitas e despesas em poucos segundos com nosso formulário intuitivo.',
  },
  {
    id: '3',
    icon: PieChart,
    title: 'Acompanhe seu orçamento',
    description:
      'Visualize gráficos detalhados e relatórios para entender para onde vai seu dinheiro.',
  },
];

interface OnboardingViewProps {
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * View de Onboarding
 */
export function OnboardingView({ onComplete, onSkip }: OnboardingViewProps) {
  const { colors, theme } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * Handler para mudança de slide
   */
  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  /**
   * Avança para o próximo slide
   */
  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  /**
   * Renderiza um slide
   */
  const renderSlide = ({ item, index }: { item: Slide; index: number }) => (
    <View style={{ width }}>
      <OnboardingSlide
        Icon={item.icon}
        title={item.title}
        description={item.description}
        isActive={index === currentIndex}
      />
    </View>
  );

  /**
   * Renderiza indicadores de página (dots)
   */
  const renderDots = () => (
    <View className="flex-row items-center justify-center mb-8">
      {slides.map((_, index) => (
        <View
          key={index}
          className="h-2 rounded-full mx-1"
          style={{
            width: index === currentIndex ? 24 : 8,
            backgroundColor:
              index === currentIndex
                ? theme.colors.primary.DEFAULT
                : colors.border,
          }}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Botão Pular */}
      <View className="items-end px-6 pt-4">
        <Pressable onPress={onSkip} className="py-2 px-4">
          <Text
            className="text-base font-medium"
            style={{ color: colors.text.secondary }}
          >
            Pular
          </Text>
        </Pressable>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Indicadores e Botão */}
      <View className="px-8 pb-8">
        {renderDots()}

        <Button
          title={currentIndex === slides.length - 1 ? 'Começar' : 'Próximo'}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}
