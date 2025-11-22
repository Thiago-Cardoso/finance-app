/**
 * Render With Providers
 *
 * Helper para renderizar componentes com todos os providers necessários
 * (Navigation, Theme, etc) nos testes.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Estado inicial da navegação (opcional)
   */
  initialRoute?: string;
}

/**
 * Wrapper com todos os providers necessários
 */
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <NavigationContainer>{children}</NavigationContainer>
    </SafeAreaProvider>
  );
}

/**
 * Renderiza componente com todos os providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

/**
 * Re-exporta tudo do Testing Library
 */
export * from '@testing-library/react-native';
