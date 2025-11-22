/**
 * View: CategoryList
 *
 * Lista de categorias com tabs por tipo e opções de gerenciamento.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { Plus, Trash2, Tag } from 'lucide-react-native';
import { Screen } from '@/shared/components/ui/Screen';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { FAB } from '@/shared/components/ui/FAB';
import { useTheme } from '@/shared/hooks/useTheme';
import { useCategoryViewModel } from '@/viewModels/useCategory.viewModel';
import { CategoryCard } from './components/CategoryCard';
import type { Category, CategoryType } from '@/shared/models/Category.model';

interface CategoryListViewProps {
  onNavigateToForm: (category?: Category) => void;
  onBack?: () => void;
}

type TabType = 'expense' | 'income' | 'all';

export function CategoryListView({ onNavigateToForm, onBack }: CategoryListViewProps) {
  const { colors, theme } = useTheme();
  const {
    categories,
    isLoading,
    error,
    loadCategories,
    deleteCategory,
    canDeleteCategory,
    clearErrors,
  } = useCategoryViewModel();

  const [activeTab, setActiveTab] = useState<TabType>('expense');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCategories(undefined, true);
    setRefreshing(false);
  }, [loadCategories]);

  const filteredCategories = categories.filter((cat) => {
    if (activeTab === 'all') return true;
    return cat.category_type === activeTab || cat.category_type === 'both';
  });

  const handleDeleteCategory = useCallback(
    async (category: Category) => {
      if (!canDeleteCategory(category.id)) {
        Alert.alert(
          'Não é possível excluir',
          category.is_default
            ? 'Esta é uma categoria padrão e não pode ser excluída.'
            : 'Esta categoria possui transações associadas e não pode ser excluída.',
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Excluir Categoria',
        `Tem certeza que deseja excluir a categoria "${category.name}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              const result = await deleteCategory(category.id);
              if (!result.success) {
                Alert.alert('Erro', 'Não foi possível excluir a categoria.');
              }
            },
          },
        ]
      );
    },
    [canDeleteCategory, deleteCategory]
  );

  const renderTab = (tab: TabType, label: string) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        key={tab}
        onPress={() => setActiveTab(tab)}
        className="flex-1 py-3 items-center"
        style={{
          borderBottomWidth: 2,
          borderBottomColor: isActive
            ? theme.colors.primary.DEFAULT
            : 'transparent',
        }}
      >
        <Text
          className="text-sm font-medium"
          style={{
            color: isActive ? theme.colors.primary.DEFAULT : colors.text.secondary,
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <CategoryCard
      category={item}
      onPress={() => onNavigateToForm(item)}
      onLongPress={() => handleDeleteCategory(item)}
      showTransactionsCount
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      icon={Tag}
      title="Nenhuma categoria"
      description={
        activeTab === 'all'
          ? 'Você ainda não possui categorias. Adicione uma nova para começar.'
          : `Você não possui categorias de ${activeTab === 'expense' ? 'despesa' : 'receita'}.`
      }
      action={{
        label: 'Adicionar Categoria',
        onPress: () => onNavigateToForm(),
      }}
    />
  );

  return (
    <Screen
      title="Categorias"
      showHeader
      scrollable={false}
      showBackButton={!!onBack}
      onBack={onBack}
      headerRight={
        <TouchableOpacity onPress={() => onNavigateToForm()}>
          <Plus size={24} color={theme.colors.primary.DEFAULT} />
        </TouchableOpacity>
      }
    >
      {/* Tabs */}
      <View
        className="flex-row mb-4"
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border.primary }}
      >
        {renderTab('expense', 'Despesas')}
        {renderTab('income', 'Receitas')}
        {renderTab('all', 'Todas')}
      </View>

      {/* Error State */}
      {error && (
        <TouchableOpacity
          onPress={clearErrors}
          className="p-3 rounded-lg mb-4"
          style={{ backgroundColor: theme.colors.error + '20' }}
        >
          <Text className="text-center" style={{ color: theme.colors.error }}>
            {error}
          </Text>
        </TouchableOpacity>
      )}

      {/* Category List */}
      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary.DEFAULT}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 100,
        }}
      />

      {/* FAB */}
      <FAB
        icon={Plus}
        onPress={() => onNavigateToForm()}
        position="bottom-right"
      />
    </Screen>
  );
}

export default CategoryListView;
