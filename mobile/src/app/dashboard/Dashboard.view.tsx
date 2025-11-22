/**
 * View: Dashboard
 *
 * Main dashboard screen with financial summary, charts and recent transactions.
 */

import React from 'react';
import { View, Text, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
