/**
 * ViewModel: Category
 *
 * Lógica de apresentação para categorias.
 */

import { useState, useCallback } from 'react';
import { useCategoriesStore } from '@/shared/stores/categoriesStore';
import categoriesService from '@/shared/services/api/categories.service';
import type {
  Category,
  CategoryType,
  CreateCategoryData,
  UpdateCategoryData,
} from '@/shared/models/Category.model';

export function useCategoryViewModel() {
  const {
    categories,
    statistics,
    isLoading: storeLoading,
    error: storeError,
    fetchCategories,
    fetchStatistics,
    addCategory,
    updateCategory: updateCategoryInStore,
    removeCategory,
    getCategoriesByType,
    getCategoryById,
    getExpenseCategories,
    getIncomeCategories,
    clearError,
  } = useCategoriesStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Load categories from API
   */
  const loadCategories = useCallback(
    async (type?: CategoryType, forceRefresh = false) => {
      if (forceRefresh) {
        useCategoriesStore.setState({ lastFetched: null });
      }
      await fetchCategories(type);
    },
    [fetchCategories]
  );

  /**
   * Load category statistics
   */
  const loadStatistics = useCallback(
    async (startDate?: string, endDate?: string) => {
      await fetchStatistics(startDate, endDate);
    },
    [fetchStatistics]
  );

  /**
   * Create a new category
   */
  const createCategory = useCallback(
    async (data: CreateCategoryData): Promise<{ success: boolean; category?: Category }> => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const newCategory = await categoriesService.createCategory(data);
        addCategory(newCategory);
        return { success: true, category: newCategory };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao criar categoria';
        setSubmitError(message);
        return { success: false };
      } finally {
        setIsSubmitting(false);
      }
    },
    [addCategory]
  );

  /**
   * Update an existing category
   */
  const updateCategory = useCallback(
    async (
      id: string,
      data: UpdateCategoryData
    ): Promise<{ success: boolean; category?: Category }> => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const updatedCategory = await categoriesService.updateCategory(id, data);
        updateCategoryInStore(id, updatedCategory);
        return { success: true, category: updatedCategory };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao atualizar categoria';
        setSubmitError(message);
        return { success: false };
      } finally {
        setIsSubmitting(false);
      }
    },
    [updateCategoryInStore]
  );

  /**
   * Delete a category
   */
  const deleteCategory = useCallback(
    async (id: string): Promise<{ success: boolean }> => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        await categoriesService.deleteCategory(id);
        removeCategory(id);
        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Erro ao deletar categoria. Verifique se não há transações associadas.';
        setSubmitError(message);
        return { success: false };
      } finally {
        setIsSubmitting(false);
      }
    },
    [removeCategory]
  );

  /**
   * Check if a category can be deleted
   */
  const canDeleteCategory = useCallback(
    (id: string): boolean => {
      const category = getCategoryById(id);
      if (!category) return false;
      // Cannot delete if it's a default category or has transactions
      return !category.is_default && (category.transactions_count ?? 0) === 0;
    },
    [getCategoryById]
  );

  /**
   * Clear any errors
   */
  const clearErrors = useCallback(() => {
    clearError();
    setSubmitError(null);
  }, [clearError]);

  return {
    // State
    categories,
    statistics,
    isLoading: storeLoading || isSubmitting,
    error: storeError || submitError,

    // Actions
    loadCategories,
    loadStatistics,
    createCategory,
    updateCategory,
    deleteCategory,
    clearErrors,

    // Selectors
    getCategoriesByType,
    getCategoryById,
    getExpenseCategories,
    getIncomeCategories,
    canDeleteCategory,
  };
}

export default useCategoryViewModel;
