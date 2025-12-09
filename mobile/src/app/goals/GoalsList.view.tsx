/**
 * View: GoalsList
 *
 * Lista de metas financeiras com progresso visual.
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
import { useGoalViewModel } from '@/viewModels/useGoal.viewModel';
import { GoalCard } from './components/GoalCard';
import { GoalsSummary } from './components/GoalsSummary';
import type { Goal } from '@/shared/models/Goal.model';

interface GoalsListViewProps {
  onNavigateToForm: (goal?: Goal) => void;
  onNavigateToDetail: (goal: Goal) => void;
  onBack?: () => void;
}

export function GoalsListView({
  onNavigateToForm,
  onNavigateToDetail,
  onBack,
}: GoalsListViewProps) {
  const { colors } = useTheme();
  const {
    goals,
    meta,
    activeGoals,
    isLoading,
    isRefreshing,
    loadGoals,
    refreshGoals,
  } = useGoalViewModel();

  // Carrega metas ao montar
  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    refreshGoals();
  }, [refreshGoals]);

  // Navegar para detalhes
  const handleGoalPress = useCallback(
    (goal: Goal) => {
      onNavigateToDetail(goal);
    },
    [onNavigateToDetail]
  );

  // Navegar para formulário
  const handleAddGoal = useCallback(() => {
    onNavigateToForm();
  }, [onNavigateToForm]);

  // Render item
  const renderGoalItem = useCallback(
    ({ item }: { item: Goal }) => (
      <GoalCard goal={item} onPress={() => handleGoalPress(item)} />
    ),
    [handleGoalPress]
  );

  // Key extractor
  const keyExtractor = useCallback((item: Goal) => item.id.toString(), []);

  // List header com resumo
  const ListHeader = useCallback(() => {
    if (!meta) return null;
    return <GoalsSummary meta={meta} activeGoals={activeGoals} />;
  }, [meta, activeGoals]);

  // Empty state
  const EmptyComponent = useCallback(() => {
    if (isLoading) return null;

    return (
      <EmptyState
        icon={Target}
        title="Nenhuma meta cadastrada"
        description="Crie sua primeira meta e comece a economizar!"
        action={{
          label: "Criar Meta",
          onPress: handleAddGoal,
        }}
      />
    );
  }, [isLoading, colors.text.secondary, handleAddGoal]);

  return (
    <Screen
      title="Metas"
      showBackButton={!!onBack}
      onBack={onBack}
      backgroundColor={colors.background}
      scrollable={false}
    >
      <FlatList
        data={goals}
        renderItem={renderGoalItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={
          goals.length === 0
            ? { flex: 1 }
            : { paddingBottom: 80 }
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB para adicionar meta */}
      <FAB
        icon={Plus}
        onPress={handleAddGoal}
        position="bottom-right"
      />
    </Screen>
  );
}
