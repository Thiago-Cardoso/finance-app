/**
 * Component: TransactionTypeSelector
 *
 * Seletor de tipo de transação (receita/despesa/transferência).
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import type { TransactionType } from '@/shared/models/Transaction.model';

interface TransactionTypeSelectorProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
  disabled?: boolean;
  showTransfer?: boolean;
}

interface TypeOption {
  type: TransactionType;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export function TransactionTypeSelector({
  value,
  onChange,
  disabled = false,
  showTransfer = true,
}: TransactionTypeSelectorProps) {
  const { colors, theme } = useTheme();

  const options: TypeOption[] = [
    {
      type: 'expense',
      label: 'Despesa',
      icon: TrendingDown,
      color: theme.colors.error.DEFAULT,
      bgColor: `${theme.colors.error.DEFAULT}20`,
    },
    {
      type: 'income',
      label: 'Receita',
      icon: TrendingUp,
      color: theme.colors.success.DEFAULT,
      bgColor: `${theme.colors.success.DEFAULT}20`,
    },
    ...(showTransfer
      ? [
          {
            type: 'transfer' as TransactionType,
            label: 'Transferência',
            icon: ArrowRightLeft,
            color: theme.colors.primary.DEFAULT,
            bgColor: `${theme.colors.primary.DEFAULT}20`,
          },
        ]
      : []),
  ];

  return (
    <View className="flex-row gap-2">
      {options.map((option) => {
        const isSelected = value === option.type;
        const Icon = option.icon;

        return (
          <TouchableOpacity
            key={option.type}
            onPress={() => !disabled && onChange(option.type)}
            className={`flex-1 flex-row items-center justify-center py-3 px-2 rounded-xl ${
              disabled ? 'opacity-50' : ''
            }`}
            style={{
              backgroundColor: isSelected ? option.bgColor : colors.surface,
              borderWidth: 2,
              borderColor: isSelected ? option.color : colors.border,
            }}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected, disabled }}
            accessibilityLabel={option.label}
          >
            <Icon
              size={18}
              color={isSelected ? option.color : colors.text.secondary}
            />
            <Text
              className="ml-1 text-sm font-medium"
              style={{
                color: isSelected ? option.color : colors.text.secondary,
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
