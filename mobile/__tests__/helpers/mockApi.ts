/**
 * Mock API Helpers
 *
 * Helpers para criar respostas fake de API nos testes.
 */

import type { User, AuthResponse } from '@/shared/models/User.model';

/**
 * Mock de usuário fake
 */
export const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

/**
 * Mock de resposta de autenticação
 */
export const mockAuthResponse: AuthResponse = {
  user: mockUser,
  token: 'fake-jwt-token',
  refresh_token: 'fake-refresh-token',
};

/**
 * Mock de erro de API
 */
export const mockApiError = {
  response: {
    data: {
      error: 'Test error message',
    },
    status: 400,
  },
};

/**
 * Mock de erro 401 (não autorizado)
 */
export const mockUnauthorizedError = {
  response: {
    data: {
      error: 'Unauthorized',
    },
    status: 401,
  },
};

/**
 * Mock de erro 500 (servidor)
 */
export const mockServerError = {
  response: {
    data: {
      error: 'Internal server error',
    },
    status: 500,
  },
};

/**
 * Helper para criar mock de resposta de sucesso
 */
export const createSuccessResponse = <T>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
});

/**
 * Helper para criar mock de resposta de erro
 */
export const createErrorResponse = (status: number, message: string) => ({
  response: {
    data: { error: message },
    status,
    statusText: 'Error',
    headers: {},
    config: {} as any,
  },
});
