/**
 * Hook useTheme
 *
 * Gerencia o tema da aplicação.
 * VERSÃO SIMPLIFICADA - Tema claro fixo para evitar loops infinitos.
 * TODO: Reimplementar tema dinâmico com arquitetura adequada.
 */

import { useMemo, useCallback } from 'react';
import { lightTheme, type ColorScheme } from '@/config/theme';

/**
 * Hook principal para uso do tema nos componentes
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, colors } = useTheme();
 *
 *   return (
 *     <View style={{ backgroundColor: colors.background }}>
 *       <Text>Tema fixo (claro)</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useTheme() {
  // Tema fixo (light) para evitar loops infinitos
  const colorScheme: ColorScheme = 'light';
  const isDark = false;
  const isSystemTheme = false;

  // Sempre retorna tema claro
  const theme = useMemo(() => lightTheme, []);
  const colors = useMemo(() => lightTheme.colors.light, []);

  // Funções dummy (não fazem nada por enquanto)
  const setColorScheme = useCallback(() => {
    console.warn('setColorScheme: Tema dinâmico desabilitado temporariamente');
  }, []);

  const toggleColorScheme = useCallback(() => {
    console.warn('toggleColorScheme: Tema dinâmico desabilitado temporariamente');
  }, []);

  const setSystemTheme = useCallback(() => {
    console.warn('setSystemTheme: Tema dinâmico desabilitado temporariamente');
  }, []);

  return {
    /** Esquema de cores atual (fixo em 'light') */
    colorScheme,
    /** Tema completo com todas as configurações */
    theme,
    /** Cores do tema atual (sempre light) */
    colors,
    /** Se está usando tema escuro (sempre false) */
    isDark,
    /** Se está seguindo o tema do sistema (sempre false) */
    isSystemTheme,
    /** Define o esquema de cores manualmente (desabilitado) */
    setColorScheme,
    /** Alterna entre claro e escuro (desabilitado) */
    toggleColorScheme,
    /** Ativa/desativa seguir tema do sistema (desabilitado) */
    setSystemTheme,
  };
}
