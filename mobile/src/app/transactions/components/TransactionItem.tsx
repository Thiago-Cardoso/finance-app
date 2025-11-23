/**
 * Component: TransactionItem
 *
 * Item individual de transação para a lista.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Tag } from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import type { Transaction } from '@/shared/models/Transaction.model';

interface TransactionItemProps {
  transaction: Transaction;
  onPress: () => void;
  onLongPress?: () => void;
}

export function TransactionItem({
  transaction,
  onPress,
  onLongPress,
}: TransactionItemProps) {
  const { colors, theme } = useTheme();

  const getIconComponent = (iconName?: string): React.ElementType => {
    if (!iconName) return Tag;
    const IconComponent = (Icons as unknown as Record<string, React.ElementType>)[iconName];
    return IconComponent || Tag;
  };

  const getAmountColor = (): string => {
    switch (transaction.transaction_type) {
      case 'income':
        return theme.colors.success.DEFAULT;
      case 'expense':
        return theme.colors.error.DEFAULT;
      case 'transfer':
        return theme.colors.primary.DEFAULT;
      default:
        return colors.text.primary;
    }
  };

  const formatAmount = (): string => {
    const amount = transaction.raw_amount;
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);

    if (transaction.transaction_type === 'expense') {
      return `-${formatted}`;
    }
    if (transaction.transaction_type === 'income') {
      return `+${formatted}`;
    }
    return formatted;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    }

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const IconComponent = getIconComponent(transaction.category?.icon);
  const categoryColor = transaction.category?.color || colors.text.secondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-row items-center py-3 px-4 mb-2 rounded-xl"
      style={{ backgroundColor: colors.surface }}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${transaction.description}, ${formatAmount()}`}
    >
      {/* Icon */}
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${categoryColor}20` }}
      >
        <IconComponent size={22} color={categoryColor} />
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text
          className="text-base font-medium"
          style={{ color: colors.text.primary }}
          numberOfLines={1}
        >
          {transaction.description}
        </Text>
        <View className="flex-row items-center mt-0.5">
          <Text
            className="text-sm"
            style={{ color: colors.text.secondary }}
          >
            {transaction.category?.name || 'Sem categoria'}
          </Text>
          {transaction.account && (
            <>
              <Text
                className="text-sm mx-1"
                style={{ color: colors.text.secondary }}
              >
                •
              </Text>
              <Text
                className="text-sm"
                style={{ color: colors.text.secondary }}
              >
                {transaction.account.name}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Amount and Date */}
      <View className="items-end">
        <Text
          className="text-base font-semibold"
          style={{ color: getAmountColor() }}
        >
          {formatAmount()}
        </Text>
        <Text
          className="text-xs mt-0.5"
          style={{ color: colors.text.secondary }}
        >
          {formatDate(transaction.date)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
