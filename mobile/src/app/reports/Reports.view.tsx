/**
 * View: Reports
 *
 * Main reports screen with financial visualizations.
 * Features: Monthly chart, category breakdown, balance evolution, filters.
 */

import React, { useMemo } from 'react';
import { View, Text, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { Download, AlertCircle, RefreshCw } from 'lucide-react-native';
import { Screen } from '@/shared/components/ui/Screen';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Alert } from '@/shared/components/ui/Alert';
import { useTheme } from '@/shared/hooks/useTheme';
import { useReportViewModel } from '@/viewModels/useReport.viewModel';
import { formatCurrency } from '@/shared/utils/formatters';
import {
  FilterBar,
  MonthlyChart,
  CategoryBreakdown,
  BalanceEvolution,
  ExportButton,
} from './components';

/**
 * Summary Header Component
 */
function SummaryHeader({
  totalIncome,
  totalExpenses,
  netBalance,
  transactionCount,
  isLoading,
}: {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  isLoading: boolean;
}) {
  const { colors, theme } = useTheme();

  if (isLoading) {
    return (
      <Card className="mx-4 p-4 mb-4">
        <View className="flex-row justify-between">
          {[1, 2, 3].map((i) => (
            <View key={i} className="items-center flex-1">
              <View
                className="w-16 h-3 rounded mb-2"
                style={{ backgroundColor: colors.border }}
              />
              <View
                className="w-20 h-5 rounded"
                style={{ backgroundColor: colors.border }}
              />
            </View>
          ))}
        </View>
      </Card>
    );
  }

  return (
    <Card className="mx-4 p-4 mb-4">
      <View className="flex-row justify-between">
        {/* Total Income */}
        <View className="items-center flex-1">
          <Text
            className="text-xs mb-1"
            style={{ color: colors.text.secondary }}
          >
            Receitas
          </Text>
          <Text
            className="text-base font-bold"
            style={{ color: theme.colors.success.DEFAULT }}
            numberOfLines={1}
          >
            {formatCurrency(totalIncome)}
          </Text>
        </View>

        {/* Divider */}
        <View
          className="w-px mx-2"
          style={{ backgroundColor: colors.border }}
        />

        {/* Total Expenses */}
        <View className="items-center flex-1">
          <Text
            className="text-xs mb-1"
            style={{ color: colors.text.secondary }}
          >
            Despesas
          </Text>
          <Text
            className="text-base font-bold"
            style={{ color: theme.colors.error.DEFAULT }}
            numberOfLines={1}
          >
            {formatCurrency(totalExpenses)}
          </Text>
        </View>

        {/* Divider */}
        <View
          className="w-px mx-2"
          style={{ backgroundColor: colors.border }}
        />

        {/* Net Balance */}
        <View className="items-center flex-1">
          <Text
            className="text-xs mb-1"
            style={{ color: colors.text.secondary }}
          >
            Saldo
          </Text>
          <Text
            className="text-base font-bold"
            style={{
              color:
                netBalance >= 0
                  ? theme.colors.success.DEFAULT
                  : theme.colors.error.DEFAULT,
            }}
            numberOfLines={1}
          >
            {formatCurrency(netBalance)}
          </Text>
        </View>
      </View>

      {/* Transaction count */}
      <Text
        className="text-xs text-center mt-3"
        style={{ color: colors.text.secondary }}
      >
        {transactionCount} transações no período
      </Text>
    </Card>
  );
}

/**
 * Error State Component
 */
function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const { colors, theme } = useTheme();

  return (
    <View className="flex-1 items-center justify-center p-8">
      <AlertCircle size={48} color={theme.colors.error.DEFAULT} />
      <Text
        className="text-lg font-semibold mt-4 text-center"
        style={{ color: colors.text.primary }}
      >
        Erro ao carregar relatórios
      </Text>
      <Text
        className="text-sm text-center mt-2 mb-6"
        style={{ color: colors.text.secondary }}
      >
        {message}
      </Text>
      <Button
        title="Tentar Novamente"
        onPress={onRetry}
        leftIcon={RefreshCw}
      />
    </View>
  );
}

/**
 * Reports View
 */
export function ReportsView() {
  const { colors } = useTheme();

  const {
    financialSummary,
    isLoading,
    isRefreshing,
    error,
    filters,
    setFilters,
    resetFilters,
    refreshReports,
    loadReports,
    monthlyChartData,
    categoryBreakdownData,
    balanceEvolutionData,
  } = useReportViewModel();

  /**
   * Get summary data
   */
  const summaryData = useMemo(() => {
    if (!financialSummary?.summary) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        transactionCount: 0,
      };
    }

    return {
      totalIncome: financialSummary.summary.total_income,
      totalExpenses: financialSummary.summary.total_expenses,
      netBalance: financialSummary.summary.net_balance,
      transactionCount: financialSummary.summary.transaction_count,
    };
  }, [financialSummary]);

  /**
   * Get current and previous month data for MonthlyChart
   */
  const monthlyData = useMemo(() => {
    if (!monthlyChartData || monthlyChartData.length === 0) {
      return { current: undefined, previous: undefined };
    }

    const lastIndex = monthlyChartData.length - 1;
    const current = {
      income: monthlyChartData[lastIndex]?.income || 0,
      expense: monthlyChartData[lastIndex]?.expense || 0,
      net:
        (monthlyChartData[lastIndex]?.income || 0) -
        (monthlyChartData[lastIndex]?.expense || 0),
    };

    const previous =
      lastIndex > 0
        ? {
            income: monthlyChartData[lastIndex - 1]?.income || 0,
            expense: monthlyChartData[lastIndex - 1]?.expense || 0,
            net:
              (monthlyChartData[lastIndex - 1]?.income || 0) -
              (monthlyChartData[lastIndex - 1]?.expense || 0),
          }
        : undefined;

    return { current, previous };
  }, [monthlyChartData]);

  /**
   * Prepare export data
   */
  const exportReportData = useMemo(() => {
    if (!financialSummary) return undefined;

    // Format period based on filters
    const periodText = filters.startDate && filters.endDate
      ? `${new Date(filters.startDate).toLocaleDateString('pt-BR')} - ${new Date(filters.endDate).toLocaleDateString('pt-BR')}`
      : 'Período Atual';

    return {
      period: periodText,
      summary: {
        totalIncome: summaryData.totalIncome,
        totalExpenses: summaryData.totalExpenses,
        netBalance: summaryData.netBalance,
        transactionCount: summaryData.transactionCount,
      },
      monthlyData: monthlyChartData.map(item => ({
        month: item.month,
        income: item.income,
        expense: item.expense,
      })),
      categoryBreakdown: categoryBreakdownData.map(item => ({
        category: item.name,
        amount: item.value,
        percentage: item.percentage,
      })),
    };
  }, [financialSummary, summaryData, monthlyChartData, categoryBreakdownData, filters]);

  // Show error state
  if (error && !isLoading && !financialSummary) {
    return (
      <Screen title="Relatórios" scrollable={false}>
        <ErrorState message={error} onRetry={loadReports} />
      </Screen>
    );
  }

  return (
    <Screen
      title="Relatórios"
      scrollable={false}
      headerRight={
        <TouchableOpacity
          onPress={refreshReports}
          disabled={isRefreshing}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          accessibilityLabel="Atualizar relatórios"
          accessibilityRole="button"
        >
          <RefreshCw
            size={22}
            color={isRefreshing ? colors.text.disabled : colors.text.primary}
          />
        </TouchableOpacity>
      }
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshReports}
            tintColor={colors.text.primary}
          />
        }
      >
        {/* Error Alert (non-blocking) */}
        {error && financialSummary && (
          <View className="px-4 mb-2">
            <Alert
              variant="warning"
              message="Alguns dados podem estar desatualizados"
            />
          </View>
        )}

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          onResetFilters={resetFilters}
        />

        {/* Summary Header */}
        <SummaryHeader
          totalIncome={summaryData.totalIncome}
          totalExpenses={summaryData.totalExpenses}
          netBalance={summaryData.netBalance}
          transactionCount={summaryData.transactionCount}
          isLoading={isLoading}
        />

        {/* Charts Section */}
        <View className="px-4">
          {/* Monthly Chart - Receitas vs Despesas */}
          <MonthlyChart
            data={monthlyChartData}
            isLoading={isLoading}
            currentMonth={monthlyData.current}
            previousMonth={monthlyData.previous}
          />

          {/* Balance Evolution */}
          <BalanceEvolution
            data={balanceEvolutionData}
            isLoading={isLoading}
          />

          {/* Category Breakdown */}
          <CategoryBreakdown
            data={categoryBreakdownData}
            isLoading={isLoading}
            title="Despesas por Categoria"
            maxItems={8}
          />
        </View>

        {/* Export Button */}
        <ExportButton
          reportData={exportReportData}
          period={exportReportData?.period}
        />

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </Screen>
  );
}

export default ReportsView;
