/**
 * Navigation Utils
 *
 * Utilitários para navegação imperativa fora de componentes React.
 */

import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '@/routes/types';

/**
 * Ref para o NavigationContainer
 * Permite navegação fora de componentes React
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navega para uma rota específica
 */
export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any);
  }
}

/**
 * Volta para a tela anterior
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

/**
 * Reseta a navegação para uma rota específica
 */
export function reset<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: name as any, params: params as any }],
    });
  }
}

/**
 * Obtém a rota atual
 */
export function getCurrentRoute() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute();
  }
  return null;
}

/**
 * Verifica se pode voltar
 */
export function canGoBack() {
  if (navigationRef.isReady()) {
    return navigationRef.canGoBack();
  }
  return false;
}
