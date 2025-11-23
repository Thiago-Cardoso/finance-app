/**
 * AccountCard Component
 *
 * Card para exibir informações de uma conta.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatters';
import { getAccountIcon } from '@/shared/constants/icons';
import { getAccountTypeLabel } from '@/shared/models/Account.model';
import type { Account } from '@/shared/models/Account.model';

interface AccountCardProps {
  account: Account;
  onPress: () => void;
  onLongPress?: () => void;
}

export function AccountCard({ account, onPress, onLongPress }: AccountCardProps) {
  const { colors, theme } = useTheme();

  const IconComponent = getAccountIcon(account.account_type);
  const accountTypeLabel = getAccountTypeLabel(account.account_type);

  const balanceColor =
    account.current_balance >= 0
      ? colors.text.primary
      : theme.colors.error.DEFAULT;

  const iconColor = account.color || theme.colors.primary.DEFAULT;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      className="mx-4 mb-3"
    >
      <View
        className="p-4 rounded-xl flex-row items-center"
        style={{
          backgroundColor: colors.card,
          opacity: account.is_active ? 1 : 0.6,
        }}
      >
        {/* Icon */}
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <IconComponent size={24} color={iconColor} />
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text
            className="text-base font-semibold mb-1"
            style={{ color: colors.text.primary }}
            numberOfLines={1}
          >
            {account.name}
          </Text>
          <Text className="text-xs" style={{ color: colors.text.secondary }}>
            {accountTypeLabel}
            {!account.is_active && ' (Inativa)'}
          </Text>
        </View>

        {/* Balance */}
        <View className="items-end mr-2">
          <Text
            className="text-base font-bold"
            style={{ color: balanceColor }}
          >
            {formatCurrency(account.current_balance)}
          </Text>
          {account.initial_balance !== account.current_balance && (
            <Text className="text-xs" style={{ color: colors.text.secondary }}>
              Inicial: {formatCurrency(account.initial_balance)}
            </Text>
          )}
        </View>

        {/* Chevron */}
        <ChevronRight size={20} color={colors.text.secondary} />
      </View>
    </TouchableOpacity>
  );
}

/**
 * Skeleton para loading
 */
export function AccountCardSkeleton() {
  const { colors } = useTheme();

  return (
    <View className="mx-4 mb-3">
      <View
        className="p-4 rounded-xl flex-row items-center"
        style={{ backgroundColor: colors.card }}
      >
        <View
          className="w-12 h-12 rounded-full mr-4"
          style={{ backgroundColor: colors.border }}
        />
        <View className="flex-1">
          <View
            className="h-4 rounded w-32 mb-2"
            style={{ backgroundColor: colors.border }}
          />
          <View
            className="h-3 rounded w-20"
            style={{ backgroundColor: colors.border }}
          />
        </View>
        <View
          className="h-5 rounded w-24"
          style={{ backgroundColor: colors.border }}
        />
      </View>
    </View>
  );
}

export default AccountCard;
