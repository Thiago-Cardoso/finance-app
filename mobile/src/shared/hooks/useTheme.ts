/**
 * Hook useTheme
 *
 * Gerencia o tema da aplicação usando ThemeStore (Zustand).
 * Suporta tema claro, escuro e sistema.
 *
 * ANTI-LOOP PATTERN:
 * - Estado gerenciado APENAS no ThemeStore (Zustand)
 * - useColorScheme do React Native para detectar tema do sistema
 * - Sem useState ou contextos que causem loops
 * - Seletores estáveis usando useMemo
 */

import { useMemo } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { lightTheme, darkTheme, type ColorScheme } from '@/config/theme';
import { useThemeStore } from '@/shared/stores/themeStore';

/**
 * Hook principal para uso do tema nos componentes
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, colors, isDark, setThemePreference } = useTheme();
 *
 *   return (
 *     <View style={{ backgroundColor: colors.background }}>
 *       <Text>Tema atual: {isDark ? 'Escuro' : 'Claro'}</Text>
 *       <Button onPress={() => setThemePreference('dark')}>
 *         Ativar tema escuro
 *       </Button>
 *     </View>
 *   );
 * }
 * ```
 */
export function useTheme() {
  // Get system color scheme (light/dark/null)
  const systemColorScheme = useSystemColorScheme() as ColorScheme | null;

  // Get theme preference from store (stable selector)
  const themePreference = useThemeStore((state) => state.themePreference);
  const setThemePreference = useThemeStore((state) => state.setThemePreference);

  // Compute active color scheme (stable with useMemo)
  const colorScheme = useMemo((): ColorScheme => {
    if (themePreference === 'system') {
      return systemColorScheme || 'light';
    }
    return themePreference as ColorScheme;
  }, [themePreference, systemColorScheme]);

  // Compute isDark (stable with useMemo)
  const isDark = useMemo(() => colorScheme === 'dark', [colorScheme]);

  // Compute isSystemTheme (stable with useMemo)
  const isSystemTheme = useMemo(() => themePreference === 'system', [themePreference]);

  // Select theme object (stable with useMemo)
  const theme = useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  // Select colors (stable with useMemo)
  const colors = useMemo(() => {
    return isDark ? darkTheme.colors.dark : lightTheme.colors.light;
  }, [isDark]);

  // Toggle between light and dark (keeps system if already on system)
  const toggleColorScheme = useMemo(() => {
    return () => {
      if (themePreference === 'system') {
        // If on system, switch to opposite of current system theme
        const targetTheme = systemColorScheme === 'dark' ? 'light' : 'dark';
        setThemePreference(targetTheme);
      } else {
        // Toggle between light and dark
        const newTheme = themePreference === 'dark' ? 'light' : 'dark';
        setThemePreference(newTheme);
      }
    };
  }, [themePreference, systemColorScheme, setThemePreference]);

  // Set system theme
  const setSystemTheme = useMemo(() => {
    return () => setThemePreference('system');
  }, [setThemePreference]);

  return {
    /** Esquema de cores atual (light/dark) */
    colorScheme,
    /** Tema completo com todas as configurações */
    theme,
    /** Cores do tema atual */
    colors,
    /** Se está usando tema escuro */
    isDark,
    /** Se está seguindo o tema do sistema */
    isSystemTheme,
    /** Preferência de tema salva (light/dark/system) */
    themePreference,
    /** Define o esquema de cores manualmente */
    setColorScheme: setThemePreference,
    /** Alterna entre claro e escuro */
    toggleColorScheme,
    /** Ativa seguir tema do sistema */
    setSystemTheme,
  };
}
