/**
 * View: InitialSetup
 *
 * Tela de configuração inicial após o onboarding.
 * Permite selecionar moeda padrão e categorias favoritas.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Screen } from '@/shared/components/ui/Screen';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/hooks/useTheme';
import { Check } from 'lucide-react-native';

interface InitialSetupViewProps {
  onComplete: (currency: string, categories: string[]) => void;
}

const CURRENCIES = [
  { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
  { code: 'USD', name: 'Dólar Americano', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
];

const CATEGORIES = [
  { id: 'alimentacao', name: 'Alimentação', icon: '🍔' },
  { id: 'transporte', name: 'Transporte', icon: '🚗' },
  { id: 'moradia', name: 'Moradia', icon: '🏠' },
  { id: 'saude', name: 'Saúde', icon: '💊' },
  { id: 'educacao', name: 'Educação', icon: '📚' },
  { id: 'lazer', name: 'Lazer', icon: '🎬' },
  { id: 'compras', name: 'Compras', icon: '🛍️' },
  { id: 'outros', name: 'Outros', icon: '📦' },
];

/**
 * View de Configuração Inicial
 */
export function InitialSetupView({ onComplete }: InitialSetupViewProps) {
  const { colors, theme } = useTheme();
  const [selectedCurrency, setSelectedCurrency] = useState('BRL');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  /**
   * Alterna seleção de categoria
   */
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  /**
   * Verifica se categoria está selecionada
   */
  const isCategorySelected = (categoryId: string) => {
    return selectedCategories.includes(categoryId);
  };

  /**
   * Finaliza configuração
   */
  const handleComplete = () => {
    onComplete(selectedCurrency, selectedCategories);
  };

  return (
    <Screen title="Configuração Inicial" scrollable>
      <View className="flex-1 px-6 py-4">
        {/* Moeda */}
        <View className="mb-8">
          <Text
            className="text-lg font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            Selecione sua moeda
          </Text>
          <Text
            className="text-sm mb-4"
            style={{ color: colors.text.secondary }}
          >
            Escolha a moeda principal para suas transações
          </Text>

          <View className="space-y-2">
            {CURRENCIES.map((currency) => (
              <Pressable
                key={currency.code}
                onPress={() => setSelectedCurrency(currency.code)}
                className="flex-row items-center justify-between p-4 rounded-lg"
                style={{
                  backgroundColor:
                    selectedCurrency === currency.code
                      ? `${theme.colors.primary.DEFAULT}15`
                      : colors.card,
                  borderWidth: selectedCurrency === currency.code ? 1 : 0,
                  borderColor: theme.colors.primary.DEFAULT,
                }}
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">{currency.symbol}</Text>
                  <View>
                    <Text
                      className="text-base font-medium"
                      style={{ color: colors.text.primary }}
                    >
                      {currency.name}
                    </Text>
                    <Text className="text-sm" style={{ color: colors.text.secondary }}>
                      {currency.code}
                    </Text>
                  </View>
                </View>

                {selectedCurrency === currency.code && (
                  <Check size={24} color={theme.colors.primary.DEFAULT} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Categorias Favoritas */}
        <View className="mb-8">
          <Text
            className="text-lg font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            Categorias favoritas (opcional)
          </Text>
          <Text
            className="text-sm mb-4"
            style={{ color: colors.text.secondary }}
          >
            Selecione as categorias que você mais usa
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const isSelected = isCategorySelected(category.id);
              return (
                <Pressable
                  key={category.id}
                  onPress={() => toggleCategory(category.id)}
                  className="flex-row items-center px-4 py-3 rounded-full"
                  style={{
                    backgroundColor: isSelected
                      ? theme.colors.primary.DEFAULT
                      : colors.card,
                  }}
                >
                  <Text className="text-base mr-2">{category.icon}</Text>
                  <Text
                    className="text-sm font-medium"
                    style={{
                      color: isSelected ? '#FFFFFF' : colors.text.primary,
                    }}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Botão Continuar */}
        <View className="mt-4">
          <Button title="Continuar" onPress={handleComplete} />
        </View>
      </View>
    </Screen>
  );
}
