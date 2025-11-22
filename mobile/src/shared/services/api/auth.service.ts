/**
 * Auth Service
 *
 * Authentication services that communicate with Rails API.
 */

import { apiClient } from './client';
import type {
  SignUpData,
  SignInData,
  AuthResponse,
  ForgotPasswordData,
  ResetPasswordData,
} from '@/shared/models/User.model';

/**
 * Sign up new user
 */
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  const response = await apiClient.post<any>('/api/v1/auth/sign_up', {
    user: data,
  });

  // Map access_token to token (Rails API compatibility)
  return {
    data: {
      user: response.data.data.user,
      token: response.data.data.access_token,
      refresh_token: response.data.data.refresh_token,
    },
    message: response.data.message,
  };
}

/**
 * Sign in existing user
 */
export async function signIn(data: SignInData): Promise<AuthResponse> {
  const response = await apiClient.post<any>('/api/v1/auth/sign_in', {
    user: data,
  });

  // Map access_token to token (Rails API compatibility)
  return {
    data: {
      user: response.data.data.user,
      token: response.data.data.access_token,
      refresh_token: response.data.data.refresh_token,
    },
    message: response.data.message,
  };
}

/**
 * Sign out user
 */
export async function signOut(): Promise<void> {
  try {
    await apiClient.delete('/api/v1/auth/sign_out');
  } catch (error) {
    // Ignore logout errors (token may already be invalid)
    console.error('Error signing out:', error);
  }
}

/**
 * Request password recovery (sends email)
 */
export async function forgotPassword(
  data: ForgotPasswordData
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    '/api/v1/auth/forgot_password',
    data
  );

  return response.data;
}

/**
 * Reset password with token
 */
export async function resetPassword(
  data: ResetPasswordData
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    '/api/v1/auth/reset_password',
    data
  );

  return response.data;
}

/**
 * Get current user data
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  const response = await apiClient.get<AuthResponse>('/api/v1/auth/me');
  return response.data;
}

/**
 * Refresh authentication token
 */
export async function refreshAuthToken(
  refreshToken: string
): Promise<{ token: string; refresh_token: string }> {
  const response = await apiClient.post<{
    data: { token: string; refresh_token: string };
  }>('/api/v1/auth/refresh', {
    refresh_token: refreshToken,
  });

  return response.data.data;
}
