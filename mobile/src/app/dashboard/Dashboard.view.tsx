/**
 * View: Dashboard
 *
 * Main dashboard screen with financial summary, charts and recent transactions.
 */

import React from 'react';
import { View, Text, RefreshControl, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Tag, Wallet, Target } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { useDashboardViewModel } from '@/viewModels/useDashboard.viewModel';
import { SummaryCard } from './components/SummaryCard';
import { ExpenseChart } from './components/ExpenseChart';
import { BudgetProgress } from './components/BudgetProgress';
import { RecentTransactionsList } from './components/RecentTransactionsList';

/**
 * Error component
 */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { colors, theme } = useTheme();

  return (
    <View className="flex-1 items-center justify-center p-6">
      <Text className="text-lg font-semibold mb-2" style={{ color: colors.text.primary }}>
        Error loading dashboard
      </Text>
      <Text className="text-base text-center mb-6" style={{ color: colors.text.secondary }}>
        {message}
      </Text>
      <View
        className="px-6 py-3 rounded-lg"
        style={{ backgroundColor: theme.colors.primary.DEFAULT }}
      >
        <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
          Try again
        </Text>
      </View>
    </View>
  );
}

/**
 * Quick Actions Component
 */
function QuickActions() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const actions = [
    {
      icon: Tag,
      label: 'Categorias',
      color: '#8B5CF6',
      onPress: () => navigation.navigate('CategoryList'),
    },
    {
      icon: Wallet,
      label: 'Contas',
      color: '#3B82F6',
      onPress: () => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento'),
    },
    {
      icon: Target,
      label: 'Orçamentos',
      color: '#10B981',
      onPress: () => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento'),
    },
  ];

  return (
    <View className="px-6 mb-4">
      <Text className="text-base font-semibold mb-3" style={{ color: colors.text.primary }}>
        Atalhos
      </Text>
      <View className="flex-row justify-between">
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={action.onPress}
            className="flex-1 items-center p-4 rounded-xl mx-1"
            style={{ backgroundColor: colors.background.secondary }}
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center mb-2"
              style={{ backgroundColor: action.color + '20' }}
            >
              <action.icon size={24} color={action.color} />
            </View>
            <Text className="text-sm font-medium" style={{ color: colors.text.primary }}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/**
 * Dashboard View
 */
export function DashboardView() {
  const { colors } = useTheme();
  const {
    data,
    isLoading,
    isRefreshing,
    error,
    loadDashboard,
    refreshDashboard,
  } = useDashboardViewModel();

  // Estado de erro
  if (error && !data) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <ErrorState message={error} onRetry={loadDashboard} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold" style={{ color: colors.text.primary }}>
          Dashboard
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshDashboard}
            tintColor={colors.text.secondary}
          />
        }
      >
        {/* Quick Actions */}
        <QuickActions />

        {/* Financial Summary */}
        <SummaryCard summary={data?.summary || null} isLoading={isLoading} />

        {/* Expense Chart */}
        <ExpenseChart
          expenses={data?.expenses_by_category || []}
          isLoading={isLoading}
        />

        {/* Budget Progress */}
        <BudgetProgress
          budgets={data?.budget_progress || []}
          isLoading={isLoading}
        />

        {/* Recent Transactions */}
        <RecentTransactionsList
          transactions={data?.recent_transactions || []}
          isLoading={isLoading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
