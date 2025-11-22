/**
 * Component: IconPicker
 *
 * Grid de seleção de ícones Lucide para categorias.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import {
  AVAILABLE_ICONS,
  getIconsByCategory,
  ICON_CATEGORY_LABELS,
  type IconCategory,
  type IconDefinition,
} from '@/shared/constants/icons';
import { Modal } from '@/shared/components/ui/Modal';

interface IconPickerProps {
  visible: boolean;
  selectedIcon?: string;
  color?: string;
  onSelect: (iconName: string) => void;
  onClose: () => void;
}

export function IconPicker({
  visible,
  selectedIcon,
  color = '#5843BE',
  onSelect,
  onClose,
}: IconPickerProps) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IconCategory | 'all'>('all');

  const filteredIcons = useMemo(() => {
    let icons = selectedCategory === 'all'
      ? AVAILABLE_ICONS
      : getIconsByCategory(selectedCategory);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      icons = icons.filter((icon) => icon.name.toLowerCase().includes(query));
    }

    return icons;
  }, [selectedCategory, searchQuery]);

  const handleSelectIcon = useCallback(
    (iconName: string) => {
      onSelect(iconName);
      onClose();
    },
    [onSelect, onClose]
  );

  const categories: Array<IconCategory | 'all'> = [
    'all',
    'food',
    'transport',
    'home',
    'entertainment',
    'health',
    'education',
    'shopping',
    'finance',
    'tech',
    'lifestyle',
    'general',
  ];

  const renderIcon = (icon: IconDefinition) => {
    const IconComponent = icon.component;
    const isSelected = selectedIcon === icon.name;

    return (
      <TouchableOpacity
        key={icon.name}
        onPress={() => handleSelectIcon(icon.name)}
        className="w-16 h-16 items-center justify-center rounded-xl m-1"
        style={{
          backgroundColor: isSelected ? color + '20' : colors.background.tertiary,
          borderWidth: isSelected ? 2 : 0,
          borderColor: color,
        }}
      >
        <IconComponent
          size={28}
          color={isSelected ? color : colors.text.secondary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Selecionar Ícone">
      <View className="flex-1">
        {/* Search */}
        <View
          className="flex-row items-center px-3 py-2 rounded-xl mb-4"
          style={{ backgroundColor: colors.background.tertiary }}
        >
          <Search size={20} color={colors.text.tertiary} />
          <TextInput
            className="flex-1 ml-2 text-base"
            style={{ color: colors.text.primary }}
            placeholder="Buscar ícone..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              className="px-3 py-2 rounded-full mr-2"
              style={{
                backgroundColor:
                  selectedCategory === cat ? color + '20' : colors.background.tertiary,
              }}
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color: selectedCategory === cat ? color : colors.text.secondary,
                }}
              >
                {cat === 'all' ? 'Todos' : ICON_CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Icons Grid */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="flex-row flex-wrap justify-center pb-4">
            {filteredIcons.map(renderIcon)}
          </View>

          {filteredIcons.length === 0 && (
            <View className="items-center py-8">
              <Text style={{ color: colors.text.secondary }}>
                Nenhum ícone encontrado
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default IconPicker;
