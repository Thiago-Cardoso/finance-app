/**
 * Store: Categories
 *
 * Zustand store for managing categories state.
 */

import { create } from 'zustand';
import type { Category, CategoryType, CategoryStatistics } from '@/shared/models/Category.model';
import categoriesService from '@/shared/services/api/categories.service';

interface CategoriesState {
  categories: Category[];
  statistics: CategoryStatistics[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchCategories: (type?: CategoryType) => Promise<void>;
  fetchStatistics: (startDate?: string, endDate?: string) => Promise<void>;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  clearError: () => void;
  reset: () => void;

  // Selectors
  getCategoriesByType: (type: CategoryType) => Category[];
  getCategoryById: (id: string) => Category | undefined;
  getExpenseCategories: () => Category[];
  getIncomeCategories: () => Category[];
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  statistics: [],
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchCategories: async (type?: CategoryType) => {
    const { lastFetched, categories } = get();

    // Check cache
    if (lastFetched && Date.now() - lastFetched < CACHE_DURATION && categories.length > 0 && !type) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const data = await categoriesService.getCategories(type);
      set({
        categories: data,
        isLoading: false,
        lastFetched: Date.now(),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar categorias',
        isLoading: false,
      });
    }
  },

  fetchStatistics: async (startDate?: string, endDate?: string) => {
    set({ isLoading: true, error: null });

    try {
      const data = await categoriesService.getCategoryStatistics(startDate, endDate);
      set({
        statistics: data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar estatísticas',
        isLoading: false,
      });
    }
  },

  addCategory: (category: Category) => {
    set((state) => ({
      categories: [...state.categories, category],
    }));
  },

  updateCategory: (id: string, updatedData: Partial<Category>) => {
    set((state) => ({
      categories: state.categories.map((cat) =>
        cat.id === id ? { ...cat, ...updatedData } : cat
      ),
    }));
  },

  removeCategory: (id: string) => {
    set((state) => ({
      categories: state.categories.filter((cat) => cat.id !== id),
    }));
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      categories: [],
      statistics: [],
      isLoading: false,
      error: null,
      lastFetched: null,
    }),

  // Selectors
  getCategoriesByType: (type: CategoryType) => {
    const { categories } = get();
    if (type === 'both') {
      return categories;
    }
    return categories.filter(
      (cat) => cat.category_type === type || cat.category_type === 'both'
    );
  },

  getCategoryById: (id: string) => {
    const { categories } = get();
    return categories.find((cat) => cat.id === id);
  },

  getExpenseCategories: () => {
    const { categories } = get();
    return categories.filter(
      (cat) => cat.category_type === 'expense' || cat.category_type === 'both'
    );
  },

  getIncomeCategories: () => {
    const { categories } = get();
    return categories.filter(
      (cat) => cat.category_type === 'income' || cat.category_type === 'both'
    );
  },
}));

export default useCategoriesStore;
