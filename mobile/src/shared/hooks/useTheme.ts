/**
 * Hook useTheme
 *
 * Gerencia o tema da aplicação (claro/escuro) com persistência.
 * Utiliza Zustand para gerenciamento de estado global e AsyncStorage para persistência.
 */

import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, type ColorScheme, type Theme } from '@/config/theme';

const THEME_STORAGE_KEY = '@finance-app:theme';

interface ThemeStore {
  colorScheme: ColorScheme;
  theme: Theme;
  isSystemTheme: boolean;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
  setSystemTheme: (useSystem: boolean) => void;
}

/**
 * Store Zustand para gerenciamento do tema
 */
export const useThemeStore = create<ThemeStore>((set, get) => ({
  colorScheme: 'light',
  theme: lightTheme,
  isSystemTheme: false,

  setColorScheme: (scheme: ColorScheme) => {
    const theme = scheme === 'dark' ? darkTheme : lightTheme;
    set({ colorScheme: scheme, theme, isSystemTheme: false });
    AsyncStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({ scheme, isSystemTheme: false })
    );
  },

  toggleColorScheme: () => {
    const currentScheme = get().colorScheme;
    const newScheme: ColorScheme = currentScheme === 'light' ? 'dark' : 'light';
    const theme = newScheme === 'dark' ? darkTheme : lightTheme;
    set({ colorScheme: newScheme, theme, isSystemTheme: false });
    AsyncStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({ scheme: newScheme, isSystemTheme: false })
    );
  },

  setSystemTheme: (useSystem: boolean) => {
    if (useSystem) {
      set({ isSystemTheme: true });
      AsyncStorage.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify({ isSystemTheme: true })
      );
    } else {
      const currentScheme = get().colorScheme;
      set({ isSystemTheme: false });
      AsyncStorage.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify({ scheme: currentScheme, isSystemTheme: false })
      );
    }
  },
}));

/**
 * Hook principal para uso do tema nos componentes
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, colorScheme, toggleColorScheme } = useTheme();
 *
 *   return (
 *     <View style={{ backgroundColor: theme.colors.light.background }}>
 *       <Button onPress={toggleColorScheme}>
 *         Alternar para {colorScheme === 'light' ? 'escuro' : 'claro'}
 *       </Button>
 *     </View>
 *   );
 * }
 * ```
 */
export function useTheme() {
  const systemColorScheme = useColorScheme();
  const {
    colorScheme,
    theme,
    isSystemTheme,
    setColorScheme,
    toggleColorScheme,
    setSystemTheme,
  } = useThemeStore();

  // Carregar preferência salva ao montar
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Sincronizar com tema do sistema se configurado
  useEffect(() => {
    if (isSystemTheme && systemColorScheme) {
      const theme = systemColorScheme === 'dark' ? darkTheme : lightTheme;
      useThemeStore.setState({
        colorScheme: systemColorScheme,
        theme,
      });
    }
  }, [systemColorScheme, isSystemTheme]);

  const loadThemePreference = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        const { scheme, isSystemTheme: useSystem } = JSON.parse(stored);

        if (useSystem) {
          const effectiveScheme = systemColorScheme || 'light';
          const theme = effectiveScheme === 'dark' ? darkTheme : lightTheme;
          useThemeStore.setState({
            colorScheme: effectiveScheme,
            theme,
            isSystemTheme: true,
          });
        } else if (scheme) {
          const theme = scheme === 'dark' ? darkTheme : lightTheme;
          useThemeStore.setState({
            colorScheme: scheme,
            theme,
            isSystemTheme: false,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar preferência de tema:', error);
    }
  };

  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;

  return {
    /** Esquema de cores atual ('light' ou 'dark') */
    colorScheme,
    /** Tema completo com todas as configurações */
    theme,
    /** Cores do tema atual (light ou dark) */
    colors,
    /** Se está usando tema escuro */
    isDark,
    /** Se está seguindo o tema do sistema */
    isSystemTheme,
    /** Define o esquema de cores manualmente */
    setColorScheme,
    /** Alterna entre claro e escuro */
    toggleColorScheme,
    /** Ativa/desativa seguir tema do sistema */
    setSystemTheme,
  };
}
