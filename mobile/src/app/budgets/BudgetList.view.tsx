/**
 * View: BudgetList
 *
 * Lista de orçamentos com progresso visual.
 */

import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Plus, Target, ChevronRight } from 'lucide-react-native';
import { Screen } from '@/shared/components/ui/Screen';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { FAB } from '@/shared/components/ui/FAB';
import { useTheme } from '@/shared/hooks/useTheme';
import { useBudgetViewModel } from '@/viewModels/useBudget.viewModel';
import { BudgetProgressBar } from './components/BudgetProgressBar';
import { BudgetAlertsList } from './components/BudgetAlert';
import { formatCurrency, formatPercent } from '@/shared/utils/formatters';
import type { Budget } from '@/shared/models/Budget.model';

interface BudgetListViewProps {
  onNavigateToForm: (budget?: Budget) => void;
  onNavigateToDetail: (budget: Budget) => void;
  onBack?: () => void;
}

/**
 * Item de orçamento na lista
 */
function BudgetItem({
  budget,
  onPress,
}: {
  budget: Budget;
  onPress: () => void;
}) {
  const { colors, theme } = useTheme();

  // Cor do status
  const statusColor =
    budget.status === 'over_budget' || budget.status === 'critical'
      ? theme.colors.error.DEFAULT
      : budget.status === 'warning'
        ? theme.colors.warning.DEFAULT
        : theme.colors.success.DEFAULT;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mx-4 mb-3"
    >
      <View
        className="p-4 rounded-xl"
        style={{ backgroundColor: colors.card }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            {/* Indicator color */}
            <View
              className="w-3 h-3 rounded-full mr-3"
              style={{ backgroundColor: budget.category_color || statusColor }}
            />
            <View className="flex-1">
              <Text
                className="text-base font-semibold"
                style={{ color: colors.text.primary }}
                numberOfLines={1}
              >
                {budget.category_name}
              </Text>
              <Text
                className="text-xs"
                style={{ color: colors.text.secondary }}
              >
                {budget.period_type === 'monthly' ? 'Mensal' : budget.period_type}
              </Text>
            </View>
          </View>

          {/* Percentage badge */}
          <View
            className="px-2 py-1 rounded-lg mr-2"
            style={{ backgroundColor: `${statusColor}15` }}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: statusColor }}
            >
              {formatPercent(budget.usage_percentage)}
            </Text>
          </View>

          <ChevronRight size={20} color={colors.text.secondary} />
        </View>

        {/* Progress bar */}
        <BudgetProgressBar
          spent={budget.spent_amount}
          limit={budget.limit_amount}
          percentage={budget.usage_percentage}
          status={budget.status}
          showValues={true}
          showPercentage={false}
          height={6}
        />
      </View>
    </TouchableOpacity>
  );
}

/**
 * Skeleton para carregamento
 */
function BudgetListSkeleton() {
  const { colors } = useTheme();

  return (
    <View className="px-4">
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="p-4 rounded-xl mb-3"
          style={{ backgroundColor: colors.card }}
        >
          <View className="flex-row items-center mb-3">
            <View
              className="w-3 h-3 rounded-full mr-3"
              style={{ backgroundColor: colors.border }}
            />
            <View className="flex-1">
              <View
                className="h-4 rounded w-32 mb-1"
                style={{ backgroundColor: colors.border }}
              />
              <View
                className="h-3 rounded w-16"
                style={{ backgroundColor: colors.border }}
              />
            </View>
          </View>
          <View
            className="h-2 rounded-full"
            style={{ backgroundColor: colors.border }}
          />
        </View>
      ))}
    </View>
  );
}

/**
 * Resumo geral de orçamentos
 */
function BudgetsSummary({
  totalSpent,
  totalLimit,
  overallUsage,
  budgetCount,
}: {
  totalSpent: number;
  totalLimit: number;
  overallUsage: number;
  budgetCount: number;
}) {
  const { colors, theme } = useTheme();

  const usageColor =
    overallUsage >= 100
      ? theme.colors.error.DEFAULT
      : overallUsage >= 70
        ? theme.colors.warning.DEFAULT
        : theme.colors.success.DEFAULT;

  return (
    <View
      className="mx-4 mb-4 p-4 rounded-xl"
      style={{ backgroundColor: colors.card }}
    >
      <Text
        className="text-sm font-medium mb-3"
        style={{ color: colors.text.secondary }}
      >
        Resumo Geral
      </Text>

      <View className="flex-row justify-between mb-3">
        <View>
          <Text className="text-xs" style={{ color: colors.text.secondary }}>
            Total Gasto
          </Text>
          <Text
            className="text-lg font-bold"
            style={{ color: colors.text.primary }}
          >
            {formatCurrency(totalSpent)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs" style={{ color: colors.text.secondary }}>
            Orçamento Total
          </Text>
          <Text
            className="text-lg font-bold"
            style={{ color: colors.text.primary }}
          >
            {formatCurrency(totalLimit)}
          </Text>
        </View>
      </View>

      {/* Progress bar geral */}
      <View
        className="h-3 rounded-full overflow-hidden mb-2"
        style={{ backgroundColor: colors.border }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${Math.min(overallUsage, 100)}%`,
            backgroundColor: usageColor,
          }}
        />
      </View>

      <View className="flex-row justify-between">
        <Text className="text-xs" style={{ color: usageColor }}>
          {formatPercent(overallUsage)} utilizado
        </Text>
        <Text className="text-xs" style={{ color: colors.text.secondary }}>
          {budgetCount} {budgetCount === 1 ? 'orçamento' : 'orçamentos'}
        </Text>
      </View>
    </View>
  );
}

export function BudgetListView({
  onNavigateToForm,
  onNavigateToDetail,
  onBack,
}: BudgetListViewProps) {
  const { theme } = useTheme();
  const {
    currentBudgets,
    alerts,
    totalSpent,
    totalLimit,
    overallUsage,
    isLoading,
    isRefreshing,
    error,
    refreshBudgets,
    loadCurrentBudgets,
    dismissAlert,
    clearErrors,
  } = useBudgetViewModel();

  useEffect(() => {
    loadCurrentBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = useCallback(async () => {
    await refreshBudgets();
  }, [refreshBudgets]);

  const renderBudgetItem = useCallback(
    ({ item }: { item: Budget }) => (
      <BudgetItem
        budget={item}
        onPress={() => onNavigateToDetail(item)}
      />
    ),
    [onNavigateToDetail]
  );

  const renderHeader = useCallback(() => {
    return (
      <View>
        {/* Alertas */}
        {alerts.length > 0 && (
          <View className="mx-4 mb-4">
            <BudgetAlertsList
              alerts={alerts}
              onDismiss={dismissAlert}
              onAlertPress={(alert) => {
                const budget = currentBudgets.find(
                  (b) => b.id === alert.budget_id
                );
                if (budget) onNavigateToDetail(budget);
              }}
            />
          </View>
        )}

        {/* Resumo */}
        {currentBudgets.length > 0 && (
          <BudgetsSummary
            totalSpent={totalSpent}
            totalLimit={totalLimit}
            overallUsage={overallUsage}
            budgetCount={currentBudgets.length}
          />
        )}
      </View>
    );
  }, [alerts, currentBudgets, totalSpent, totalLimit, overallUsage, dismissAlert, onNavigateToDetail]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;

    return (
      <EmptyState
        icon={Target}
        title="Nenhum orçamento"
        description="Crie orçamentos para controlar seus gastos por categoria."
        action={{
          label: 'Criar Orçamento',
          onPress: () => onNavigateToForm(),
        }}
      />
    );
  }, [isLoading, onNavigateToForm]);

  return (
    <Screen
      title="Orçamentos"
      showHeader
      scrollable={false}
      showBackButton={!!onBack}
      onBack={onBack}
    >
      {/* Error State */}
      {error && (
        <TouchableOpacity
          onPress={clearErrors}
          className="mx-4 p-3 rounded-lg mb-4"
          style={{ backgroundColor: `${theme.colors.error.DEFAULT}20` }}
        >
          <Text className="text-center" style={{ color: theme.colors.error.DEFAULT }}>
            {error}
          </Text>
        </TouchableOpacity>
      )}

      {/* Loading State */}
      {isLoading && currentBudgets.length === 0 ? (
        <BudgetListSkeleton />
      ) : (
        <FlatList
          data={currentBudgets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBudgetItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary.DEFAULT}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 100,
            paddingTop: 16,
          }}
        />
      )}

      {/* FAB */}
      <FAB
        icon={Plus}
        onPress={() => onNavigateToForm()}
        position="bottom-right"
      />
    </Screen>
  );
}

export default BudgetListView;
