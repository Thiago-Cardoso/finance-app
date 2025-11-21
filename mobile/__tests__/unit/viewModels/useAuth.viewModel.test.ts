/**
 * useAuth ViewModel Tests
 *
 * Testes unitários para o ViewModel de autenticação.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuthViewModel } from '@/viewModels/useAuth.viewModel';
import { useAuthStore } from '@/shared/stores/authStore';
import * as authService from '@/shared/services/api/auth.service';
import { mockAuthResponse, mockUser } from '../../helpers/mockApi';

// Mock do authStore
jest.mock('@/shared/stores/authStore');

// Mock do authService
jest.mock('@/shared/services/api/auth.service');

describe('useAuth ViewModel', () => {
  const mockSetUser = jest.fn();
  const mockSetTokens = jest.fn();
  const mockClearAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock do authStore
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      setUser: mockSetUser,
      setTokens: mockSetTokens,
      clearAuth: mockClearAuth,
    });
  });

  describe('handleSignIn', () => {
    it('should sign in successfully', async () => {
      const mockSignIn = authService.signIn as jest.Mock;
      mockSignIn.mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuthViewModel());

      await act(async () => {
        await result.current.handleSignIn('test@example.com', 'password123');
      });

      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      expect(mockSetTokens).toHaveBeenCalledWith(
        'fake-jwt-token',
        'fake-refresh-token'
      );
    });

    it('should handle sign in error', async () => {
      const mockSignIn = authService.signIn as jest.Mock;
      mockSignIn.mockRejectedValue({
        response: { data: { error: 'Invalid credentials' } },
      });

      const { result } = renderHook(() => useAuthViewModel());

      await act(async () => {
        await result.current.handleSignIn('test@example.com', 'wrongpassword');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Invalid credentials');
      });

      expect(mockSetUser).not.toHaveBeenCalled();
      expect(mockSetTokens).not.toHaveBeenCalled();
    });
  });

  describe('handleSignUp', () => {
    it('should sign up successfully', async () => {
      const mockSignUp = authService.signUp as jest.Mock;
      mockSignUp.mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuthViewModel());

      const signUpData = {
        email: 'newuser@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        first_name: 'New',
        last_name: 'User',
      };

      await act(async () => {
        await result.current.handleSignUp(signUpData);
      });

      expect(mockSignUp).toHaveBeenCalledWith(signUpData);
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      expect(mockSetTokens).toHaveBeenCalledWith(
        'fake-jwt-token',
        'fake-refresh-token'
      );
    });

    it('should handle sign up error', async () => {
      const mockSignUp = authService.signUp as jest.Mock;
      mockSignUp.mockRejectedValue({
        response: { data: { error: 'Email already exists' } },
      });

      const { result } = renderHook(() => useAuthViewModel());

      const signUpData = {
        email: 'existing@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        first_name: 'New',
        last_name: 'User',
      };

      await act(async () => {
        await result.current.handleSignUp(signUpData);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Email already exists');
      });
    });
  });

  describe('handleSignOut', () => {
    it('should sign out successfully', async () => {
      const mockSignOut = authService.signOut as jest.Mock;
      mockSignOut.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuthViewModel());

      await act(async () => {
        await result.current.handleSignOut();
      });

      expect(mockSignOut).toHaveBeenCalled();
      expect(mockClearAuth).toHaveBeenCalled();
    });

    it('should clear auth even if signOut fails', async () => {
      const mockSignOut = authService.signOut as jest.Mock;
      mockSignOut.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuthViewModel());

      await act(async () => {
        await result.current.handleSignOut();
      });

      expect(mockClearAuth).toHaveBeenCalled();
    });
  });

  describe('handleForgotPassword', () => {
    it('should send password reset email successfully', async () => {
      const mockForgotPassword = authService.forgotPassword as jest.Mock;
      mockForgotPassword.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuthViewModel());

      await act(async () => {
        await result.current.handleForgotPassword('test@example.com');
      });

      expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
      await waitFor(() => {
        expect(result.current.success).toBeTruthy();
      });
    });

    it('should handle forgot password error', async () => {
      const mockForgotPassword = authService.forgotPassword as jest.Mock;
      mockForgotPassword.mockRejectedValue({
        response: { data: { error: 'User not found' } },
      });

      const { result } = renderHook(() => useAuthViewModel());

      await act(async () => {
        await result.current.handleForgotPassword('nonexistent@example.com');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('User not found');
      });
    });
  });
});
