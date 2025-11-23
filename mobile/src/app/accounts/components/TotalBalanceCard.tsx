/**
 * TotalBalanceCard Component
 *
 * Exibe o saldo total consolidado de todas as contas.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatters';

interface TotalBalanceCardProps {
  totalBalance: number;
  accountsCount: number;
  income?: number;
  expense?: number;
}

export function TotalBalanceCard({
  totalBalance,
  accountsCount,
  income = 0,
  expense = 0,
}: TotalBalanceCardProps) {
  const { theme } = useTheme();

  return (
    <View
      className="mx-4 mb-4 p-5 rounded-2xl"
      style={{ backgroundColor: theme.colors.primary.DEFAULT }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-2">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <Wallet size={20} color="#FFFFFF" />
        </View>
        <View>
          <Text className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Saldo Total
          </Text>
          <Text className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            {accountsCount} {accountsCount === 1 ? 'conta ativa' : 'contas ativas'}
          </Text>
        </View>
      </View>

      {/* Total Balance */}
      <Text className="text-3xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
        {formatCurrency(totalBalance)}
      </Text>

      {/* Income / Expense Summary (optional) */}
      {(income > 0 || expense > 0) && (
        <View className="flex-row justify-between pt-4 border-t border-white/20">
          <View className="flex-row items-center">
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
            >
              <TrendingUp size={16} color="#10B981" />
            </View>
            <View>
              <Text className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Receitas
              </Text>
              <Text className="text-sm font-semibold" style={{ color: '#10B981' }}>
                {formatCurrency(income)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
            >
              <TrendingDown size={16} color="#EF4444" />
            </View>
            <View>
              <Text className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Despesas
              </Text>
              <Text className="text-sm font-semibold" style={{ color: '#EF4444' }}>
                {formatCurrency(expense)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

export default TotalBalanceCard;
