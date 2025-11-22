/**
 * Component: ColorPicker
 *
 * Seletor de cores pré-definidas para categorias.
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { CATEGORY_COLORS, type ColorOption } from '@/shared/constants/colors';
import { Modal } from '@/shared/components/ui/Modal';

interface ColorPickerProps {
  visible: boolean;
  selectedColor?: string;
  onSelect: (color: string) => void;
  onClose: () => void;
}

export function ColorPicker({
  visible,
  selectedColor,
  onSelect,
  onClose,
}: ColorPickerProps) {
  const { colors } = useTheme();

  const handleSelectColor = useCallback(
    (color: string) => {
      onSelect(color);
      onClose();
    },
    [onSelect, onClose]
  );

  const renderColorOption = (colorOption: ColorOption) => {
    const isSelected =
      selectedColor?.toLowerCase() === colorOption.value.toLowerCase();

    return (
      <TouchableOpacity
        key={colorOption.value}
        onPress={() => handleSelectColor(colorOption.value)}
        className="w-16 h-16 rounded-xl m-1 items-center justify-center"
        style={{
          backgroundColor: colorOption.value,
          borderWidth: isSelected ? 3 : 0,
          borderColor: colors.text.primary,
        }}
      >
        {isSelected && <Check size={28} color="#FFFFFF" strokeWidth={3} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Selecionar Cor">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap justify-center pb-4">
          {CATEGORY_COLORS.map(renderColorOption)}
        </View>

        {/* Selected Color Preview */}
        {selectedColor && (
          <View className="mt-4 p-4 rounded-xl items-center" style={{ backgroundColor: colors.background.tertiary }}>
            <Text className="text-sm mb-2" style={{ color: colors.text.secondary }}>
              Cor selecionada
            </Text>
            <View className="flex-row items-center">
              <View
                className="w-8 h-8 rounded-full mr-2"
                style={{ backgroundColor: selectedColor }}
              />
              <Text className="text-base font-medium" style={{ color: colors.text.primary }}>
                {selectedColor.toUpperCase()}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
}

export default ColorPicker;
