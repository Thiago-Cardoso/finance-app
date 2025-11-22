/**
 * Preferences Store
 *
 * Store Zustand para gerenciar preferências do usuário e estado de onboarding.
 * Persiste dados usando AsyncStorage.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@finance:onboarding_completed';
const CURRENCY_KEY = '@finance:currency';
const FAVORITE_CATEGORIES_KEY = '@finance:favorite_categories';

interface PreferencesStore {
  // Estado
  onboardingCompleted: boolean;
  currency: string;
  favoriteCategories: string[];
  isLoading: boolean;

  // Ações
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
  setFavoriteCategories: (categories: string[]) => Promise<void>;
  loadPreferences: () => Promise<void>;
  resetPreferences: () => Promise<void>;
}

/**
 * Store de preferências do usuário
 */
export const usePreferencesStore = create<PreferencesStore>((set) => ({
  // Estado inicial
  onboardingCompleted: false,
  currency: 'BRL',
  favoriteCategories: [],
  isLoading: true,

  /**
   * Marca o onboarding como completado
   */
  setOnboardingCompleted: async (completed: boolean) => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(completed));
      set({ onboardingCompleted: completed });
    } catch (error) {
      console.error('Erro ao salvar status de onboarding:', error);
    }
  },

  /**
   * Define a moeda padrão
   */
  setCurrency: async (currency: string) => {
    try {
      await AsyncStorage.setItem(CURRENCY_KEY, currency);
      set({ currency });
    } catch (error) {
      console.error('Erro ao salvar moeda:', error);
    }
  },

  /**
   * Define as categorias favoritas
   */
  setFavoriteCategories: async (categories: string[]) => {
    try {
      await AsyncStorage.setItem(FAVORITE_CATEGORIES_KEY, JSON.stringify(categories));
      set({ favoriteCategories: categories });
    } catch (error) {
      console.error('Erro ao salvar categorias favoritas:', error);
    }
  },

  /**
   * Carrega preferências do AsyncStorage
   */
  loadPreferences: async () => {
    try {
      set({ isLoading: true });

      const [onboardingData, currencyData, categoriesData] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEY),
        AsyncStorage.getItem(CURRENCY_KEY),
        AsyncStorage.getItem(FAVORITE_CATEGORIES_KEY),
      ]);

      set({
        onboardingCompleted: onboardingData ? JSON.parse(onboardingData) : false,
        currency: currencyData || 'BRL',
        favoriteCategories: categoriesData ? JSON.parse(categoriesData) : [],
        isLoading: false,
      });
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
      set({ isLoading: false });
    }
  },

  /**
   * Reseta todas as preferências (útil para testes)
   */
  resetPreferences: async () => {
    try {
      await AsyncStorage.multiRemove([
        ONBOARDING_KEY,
        CURRENCY_KEY,
        FAVORITE_CATEGORIES_KEY,
      ]);

      set({
        onboardingCompleted: false,
        currency: 'BRL',
        favoriteCategories: [],
      });
    } catch (error) {
      console.error('Erro ao resetar preferências:', error);
    }
  },
}));
