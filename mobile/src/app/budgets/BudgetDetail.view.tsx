/**
 * View: BudgetDetail
 *
 * Tela de detalhes de um orçamento específico.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import {
  Edit3,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Bell,
  BellOff,
} from 'lucide-react-native';
import { Screen } from '@/shared/components/ui/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { useBudgetViewModel } from '@/viewModels/useBudget.viewModel';
import { BudgetProgressBar } from './components/BudgetProgressBar';
import { formatCurrency, formatDate, formatPercent } from '@/shared/utils/formatters';
import type { Budget } from '@/shared/models/Budget.model';

interface BudgetDetailViewProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onBack: () => void;
  onDeleted: () => void;
}

/**
 * Card de estatística
 */
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-1 p-4 rounded-xl mr-3 last:mr-0"
      style={{ backgroundColor: colors.card }}
    >
      <View className="flex-row items-center mb-2">
        <View
          className="w-8 h-8 rounded-full items-center justify-center mr-2"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={16} color={color} />
        </View>
      </View>
      <Text className="text-xs" style={{ color: colors.text.secondary }}>
        {label}
      </Text>
      <Text
        className="text-lg font-bold"
        style={{ color: colors.text.primary }}
      >
        {value}
      </Text>
    </View>
  );
}

/**
 * Transação simulada (para mostrar transações da categoria)
 */
interface SimpleTransaction {
  id: number;
  description: string;
  amount: number;
  date: string;
}

/**
 * Item de transação na lista
 */
function TransactionItem({ transaction }: { transaction: SimpleTransaction }) {
  const { colors, theme } = useTheme();

  return (
    <View
      className="flex-row items-center p-4 border-b"
      style={{ borderBottomColor: colors.border }}
    >
      <View className="flex-1">
        <Text
          className="text-sm font-medium"
          style={{ color: colors.text.primary }}
          numberOfLines={1}
        >
          {transaction.description}
        </Text>
        <Text className="text-xs" style={{ color: colors.text.secondary }}>
          {formatDate(transaction.date)}
        </Text>
      </View>
      <Text
        className="text-sm font-semibold"
        style={{ color: theme.colors.error.DEFAULT }}
      >
        -{formatCurrency(transaction.amount)}
      </Text>
    </View>
  );
}

export function BudgetDetailView({
  budget: initialBudget,
  onEdit,
  onBack,
  onDeleted,
}: BudgetDetailViewProps) {
  const { colors, theme } = useTheme();
  const { loadBudgetById, deleteBudget, isLoading, isRefreshing } =
    useBudgetViewModel();

  const [budget, setBudget] = useState<Budget>(initialBudget);
  const [refreshing, setRefreshing] = useState(false);

  // Status color
  const statusColor =
    budget.status === 'over_budget' || budget.status === 'critical'
      ? theme.colors.error.DEFAULT
      : budget.status === 'warning'
        ? theme.colors.warning.DEFAULT
        : theme.colors.success.DEFAULT;

  // Status text
  const statusText =
    budget.status === 'over_budget'
      ? 'Excedido'
      : budget.status === 'critical'
        ? 'Crítico'
        : budget.status === 'warning'
          ? 'Atenção'
          : 'No limite';

  // Transações mockadas (em produção viriam da API)
  const mockTransactions: SimpleTransaction[] = [
    { id: 1, description: 'Supermercado Extra', amount: 250.0, date: '2024-01-15' },
    { id: 2, description: 'Mercado Livre', amount: 89.9, date: '2024-01-14' },
    { id: 3, description: 'Carrefour', amount: 175.5, date: '2024-01-12' },
    { id: 4, description: 'Hortifruti', amount: 45.0, date: '2024-01-10' },
    { id: 5, description: 'Padaria', amount: 32.0, date: '2024-01-08' },
  ];

  /**
   * Atualiza dados do orçamento
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const updated = await loadBudgetById(budget.id);
    if (updated) {
      setBudget(updated);
    }
    setRefreshing(false);
  }, [budget.id, loadBudgetById]);

  /**
   * Confirma exclusão
   */
  const handleDelete = useCallback(() => {
    Alert.alert(
      'Excluir Orçamento',
      `Tem certeza que deseja excluir o orçamento de "${budget.category_name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteBudget(budget.id);
            if (result.success) {
              Alert.alert('Sucesso', 'Orçamento excluído com sucesso!', [
                { text: 'OK', onPress: onDeleted },
              ]);
            } else {
              Alert.alert('Erro', result.error || 'Erro ao excluir orçamento');
            }
          },
        },
      ]
    );
  }, [budget.id, budget.category_name, deleteBudget, onDeleted]);

  // Cabeçalho com ações
  const headerRight = (
    <View className="flex-row">
      <TouchableOpacity
        onPress={() => onEdit(budget)}
        className="mr-4"
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Edit3 size={22} color={theme.colors.primary.DEFAULT} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleDelete}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Trash2 size={22} color={theme.colors.error.DEFAULT} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Screen
      title="Detalhes do Orçamento"
      showHeader
      showBackButton
      onBack={onBack}
      headerRight={headerRight}
      scrollable={false}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary.DEFAULT}
          />
        }
      >
        {/* Header com categoria */}
        <View
          className="mx-4 mt-4 p-5 rounded-xl"
          style={{ backgroundColor: colors.card }}
        >
          <View className="flex-row items-center mb-4">
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-4"
              style={{
                backgroundColor:
                  budget.category_color || theme.colors.primary.DEFAULT,
              }}
            >
              <Text className="text-xl">
                {budget.category_icon || '💰'}
              </Text>
            </View>
            <View className="flex-1">
              <Text
                className="text-xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {budget.category_name}
              </Text>
              <View className="flex-row items-center mt-1">
                <View
                  className="px-2 py-1 rounded-lg mr-2"
                  style={{ backgroundColor: `${statusColor}20` }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: statusColor }}
                  >
                    {statusText}
                  </Text>
                </View>
                <Text className="text-xs" style={{ color: colors.text.secondary }}>
                  {budget.period_type === 'monthly' ? 'Mensal' : budget.period_type}
                </Text>
              </View>
            </View>
          </View>

          {/* Progresso */}
          <BudgetProgressBar
            spent={budget.spent_amount}
            limit={budget.limit_amount}
            percentage={budget.usage_percentage}
            status={budget.status}
            showValues={true}
            showPercentage={true}
            height={10}
          />
        </View>

        {/* Estatísticas */}
        <View className="flex-row mx-4 mt-4">
          <StatCard
            label="Gasto"
            value={formatCurrency(budget.spent_amount)}
            icon={TrendingUp}
            color={theme.colors.error.DEFAULT}
          />
          <StatCard
            label="Disponível"
            value={formatCurrency(budget.remaining_amount)}
            icon={TrendingDown}
            color={theme.colors.success.DEFAULT}
          />
        </View>

        {/* Info do período */}
        <View
          className="mx-4 mt-4 p-4 rounded-xl"
          style={{ backgroundColor: colors.card }}
        >
          <View className="flex-row items-center mb-3">
            <Calendar size={18} color={colors.text.secondary} />
            <Text
              className="text-sm font-medium ml-2"
              style={{ color: colors.text.primary }}
            >
              Período
            </Text>
          </View>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-xs" style={{ color: colors.text.secondary }}>
                Início
              </Text>
              <Text
                className="text-sm font-medium"
                style={{ color: colors.text.primary }}
              >
                {formatDate(budget.period_start)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs" style={{ color: colors.text.secondary }}>
                Fim
              </Text>
              <Text
                className="text-sm font-medium"
                style={{ color: colors.text.primary }}
              >
                {formatDate(budget.period_end)}
              </Text>
            </View>
          </View>
        </View>

        {/* Configuração de alertas */}
        <View
          className="mx-4 mt-4 p-4 rounded-xl"
          style={{ backgroundColor: colors.card }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              {budget.is_alert_enabled ? (
                <Bell size={18} color={theme.colors.primary.DEFAULT} />
              ) : (
                <BellOff size={18} color={colors.text.secondary} />
              )}
              <Text
                className="text-sm font-medium ml-2"
                style={{ color: colors.text.primary }}
              >
                Alertas
              </Text>
            </View>
            <View
              className="px-3 py-1 rounded-full"
              style={{
                backgroundColor: budget.is_alert_enabled
                  ? `${theme.colors.primary.DEFAULT}20`
                  : colors.border,
              }}
            >
              <Text
                className="text-xs font-medium"
                style={{
                  color: budget.is_alert_enabled
                    ? theme.colors.primary.DEFAULT
                    : colors.text.secondary,
                }}
              >
                {budget.is_alert_enabled
                  ? `Ativo em ${budget.alert_threshold}%`
                  : 'Desativado'}
              </Text>
            </View>
          </View>
        </View>

        {/* Transações da categoria */}
        <View className="mx-4 mt-4">
          <Text
            className="text-base font-semibold mb-3"
            style={{ color: colors.text.primary }}
          >
            Transações Recentes
          </Text>
          <View
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: colors.card }}
          >
            {mockTransactions.length === 0 ? (
              <View className="p-6 items-center">
                <Text style={{ color: colors.text.secondary }}>
                  Nenhuma transação encontrada
                </Text>
              </View>
            ) : (
              mockTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))
            )}
          </View>
        </View>

        {/* Dica */}
        <View
          className="mx-4 mt-4 p-4 rounded-xl"
          style={{ backgroundColor: `${theme.colors.primary.DEFAULT}10` }}
        >
          <Text className="text-xs" style={{ color: colors.text.secondary }}>
            💡 Dica: Mantenha seus gastos abaixo de 70% do orçamento para ter uma margem
            de segurança no final do mês.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

export default BudgetDetailView;
