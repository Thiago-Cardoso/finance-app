/**
 * GoalTypeSelector Component
 *
 * Seletor de tipo de meta.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { GoalTypeIcon } from './GoalTypeIcon';
import { getGoalTypeText } from '@/shared/models/Goal.model';
import type { GoalType } from '@/shared/models/Goal.model';

interface GoalTypeSelectorProps {
  selectedType: GoalType;
  onSelect: (type: GoalType) => void;
}

const GOAL_TYPES: GoalType[] = [
  'savings',
  'debt_payoff',
  'investment',
  'expense_reduction',
  'general',
];

export function GoalTypeSelector({ selectedType, onSelect }: GoalTypeSelectorProps) {
  const { colors, theme } = useTheme();

  return (
    <View className="flex-row flex-wrap gap-2">
      {GOAL_TYPES.map((type) => {
        const isSelected = selectedType === type;

        return (
          <TouchableOpacity
            key={type}
            onPress={() => onSelect(type)}
            className="flex-1 min-w-[45%] p-3 rounded-xl flex-row items-center"
            style={{
              backgroundColor: isSelected
                ? `${theme.colors.primary.DEFAULT}20`
                : colors.card,
              borderWidth: isSelected ? 2 : 1,
              borderColor: isSelected ? theme.colors.primary.DEFAULT : colors.border,
            }}
          >
            <GoalTypeIcon
              type={type}
              size={20}
              color={isSelected ? theme.colors.primary.DEFAULT : colors.text.secondary}
            />
            <Text
              className="text-sm ml-2 flex-1"
              style={{
                color: isSelected ? theme.colors.primary.DEFAULT : colors.text.primary,
                fontWeight: isSelected ? '600' : '400',
              }}
              numberOfLines={1}
            >
              {getGoalTypeText(type)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
