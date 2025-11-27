/**
 * Theme Store
 *
 * Store Zustand para gerenciar tema do aplicativo (claro/escuro/sistema).
 * Persiste dados usando AsyncStorage.
 *
 * ANTI-LOOP PATTERN:
 * - Estado gerenciado APENAS no Zustand (sem useState)
 * - Seletores estáveis usando hooks dedicados
 * - AsyncStorage para persistência sem trigger de re-renders
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import type { ColorScheme } from '@/config/theme';

const THEME_KEY = '@finance:theme_preference';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeStore {
  // Estado
  themePreference: ThemePreference;
  isLoading: boolean;

  // Ações
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  loadThemePreference: () => Promise<void>;
  resetTheme: () => Promise<void>;

  // Computed (derived state)
  getActiveColorScheme: (systemColorScheme: ColorScheme | null) => ColorScheme;
}

/**
 * Store de tema do aplicativo
 */
export const useThemeStore = create<ThemeStore>((set, get) => ({
  // Estado inicial
  themePreference: 'system',
  isLoading: true,

  /**
   * Define a preferência de tema
   */
  setThemePreference: async (preference: ThemePreference) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, preference);
      set({ themePreference: preference });
    } catch (error) {
      console.error('Erro ao salvar preferência de tema:', error);
    }
  },

  /**
   * Carrega a preferência de tema do AsyncStorage
   */
  loadThemePreference: async () => {
    try {
      set({ isLoading: true });

      const savedPreference = await AsyncStorage.getItem(THEME_KEY);

      set({
        themePreference: (savedPreference as ThemePreference) || 'system',
        isLoading: false,
      });
    } catch (error) {
      console.error('Erro ao carregar preferência de tema:', error);
      set({ isLoading: false });
    }
  },

  /**
   * Reseta o tema para o padrão (sistema)
   */
  resetTheme: async () => {
    try {
      await AsyncStorage.removeItem(THEME_KEY);
      set({ themePreference: 'system' });
    } catch (error) {
      console.error('Erro ao resetar tema:', error);
    }
  },

  /**
   * Retorna o ColorScheme ativo baseado na preferência e tema do sistema
   */
  getActiveColorScheme: (systemColorScheme: ColorScheme | null): ColorScheme => {
    const { themePreference } = get();

    if (themePreference === 'system') {
      return systemColorScheme || 'light';
    }

    return themePreference as ColorScheme;
  },
}));

/**
 * Stable selector hooks para prevenir infinite loops
 */
export const useThemePreference = () => useThemeStore((state) => state.themePreference);
export const useThemeLoading = () => useThemeStore((state) => state.isLoading);

export default useThemeStore;
