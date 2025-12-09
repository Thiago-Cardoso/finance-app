/**
 * PrioritySelector Component
 *
 * Seletor de prioridade da meta.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { getGoalPriorityText, getGoalPriorityColor } from '@/shared/models/Goal.model';
import type { GoalPriority } from '@/shared/models/Goal.model';

interface PrioritySelectorProps {
  selectedPriority: GoalPriority;
  onSelect: (priority: GoalPriority) => void;
}

const PRIORITIES: GoalPriority[] = ['low', 'medium', 'high', 'urgent'];

export function PrioritySelector({ selectedPriority, onSelect }: PrioritySelectorProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-row gap-2">
      {PRIORITIES.map((priority) => {
        const isSelected = selectedPriority === priority;
        const priorityColor = getGoalPriorityColor(priority);

        return (
          <TouchableOpacity
            key={priority}
            onPress={() => onSelect(priority)}
            className="flex-1 p-3 rounded-xl items-center"
            style={{
              backgroundColor: isSelected ? `${priorityColor}20` : colors.card,
              borderWidth: isSelected ? 2 : 1,
              borderColor: isSelected ? priorityColor : colors.border,
            }}
          >
            <View
              className="w-3 h-3 rounded-full mb-1"
              style={{ backgroundColor: priorityColor }}
            />
            <Text
              className="text-sm text-center"
              style={{
                color: isSelected ? priorityColor : colors.text.primary,
                fontWeight: isSelected ? '600' : '400',
              }}
            >
              {getGoalPriorityText(priority)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
