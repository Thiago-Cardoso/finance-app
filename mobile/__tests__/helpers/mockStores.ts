/**
 * Mock Stores
 *
 * Mocks de Zustand stores para testes.
 */

import type { User } from '@/shared/models/User.model';

/**
 * Estado inicial do authStore para testes
 */
export const mockAuthStoreInitialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  biometricEnabled: false,
};

/**
 * Mock do authStore autenticado
 */
export const mockAuthStoreAuthenticated = {
  user: {
    id: '1',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  } as User,
  token: 'fake-jwt-token',
  refreshToken: 'fake-refresh-token',
  isAuthenticated: true,
  isLoading: false,
  biometricEnabled: false,
};

/**
 * Cria mock do authStore
 */
export const createMockAuthStore = (overrides = {}) => ({
  ...mockAuthStoreInitialState,
  setUser: jest.fn(),
  setTokens: jest.fn(),
  clearAuth: jest.fn(),
  loadUser: jest.fn(),
  toggleBiometric: jest.fn(),
  ...overrides,
});

/**
 * Estado inicial do preferencesStore para testes
 */
export const mockPreferencesStoreInitialState = {
  onboardingCompleted: false,
  currency: 'BRL',
  favoriteCategories: [],
  isLoading: false,
};

/**
 * Cria mock do preferencesStore
 */
export const createMockPreferencesStore = (overrides = {}) => ({
  ...mockPreferencesStoreInitialState,
  setOnboardingCompleted: jest.fn(),
  setCurrency: jest.fn(),
  setFavoriteCategories: jest.fn(),
  loadPreferences: jest.fn(),
  resetPreferences: jest.fn(),
  ...overrides,
});

/**
 * Mock completo de todos os stores
 */
export const mockStores = {
  authStore: createMockAuthStore(),
  preferencesStore: createMockPreferencesStore(),
};

/**
 * Reseta todos os mocks dos stores
 */
export const resetMockStores = () => {
  Object.values(mockStores).forEach((store) => {
    Object.values(store).forEach((value) => {
      if (typeof value === 'function' && 'mockClear' in value) {
        (value as jest.Mock).mockClear();
      }
    });
  });
};
