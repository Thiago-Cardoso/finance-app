/**
 * ViewModel: Authentication
 *
 * Business logic for authentication (login, signup, logout).
 * Follows MVVM pattern separating logic from presentation.
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '@/shared/stores/authStore';
import * as authService from '@/shared/services/api/auth.service';
import type {
  SignUpFormData,
  SignInFormData,
  ForgotPasswordFormData,
} from '@/shared/lib/mobile-validations';

export function useAuthViewModel() {
  const { login, logout, user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sign in user
   */
  const handleSignIn = async (data: SignInFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.signIn(data);

      await login(
        response.data.user,
        response.data.token,
        response.data.refresh_token
      );

      return { success: true };
    } catch (err: any) {
      const message = err.message || 'Error signing in';
      setError(message);
      Alert.alert('Sign In Error', message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign up new user
   */
  const handleSignUp = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.signUp(data);

      await login(
        response.data.user,
        response.data.token,
        response.data.refresh_token
      );

      Alert.alert(
        'Sign Up Successful!',
        'Your account has been created successfully.',
        [{ text: 'OK' }]
      );

      return { success: true };
    } catch (err: any) {
      if (__DEV__) {
        console.error('Sign up error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
      }

      // Extract detailed error message
      let message = 'Error signing up';

      if (err.response?.data) {
        const errorData = err.response.data;

        // Check for validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors
            .map((e: any) => `${e.field}: ${e.message}`)
            .join('\n');
          message = errorMessages || errorData.error || message;
        } else if (errorData.error) {
          message = errorData.error;
        } else if (errorData.message) {
          message = errorData.message;
        }
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
      Alert.alert('Sign Up Error', message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out user
   */
  const handleSignOut = async () => {
    try {
      setIsLoading(true);

      // Call API to invalidate token
      await authService.signOut();

      // Clear local state
      await logout();

      return { success: true };
    } catch (err: any) {
      console.error('Error signing out:', err);
      // Even with error, do local logout
      await logout();
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Request password recovery
   */
  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.forgotPassword(data);

      Alert.alert(
        'Email Sent',
        response.message ||
          'Check your email for password recovery instructions.',
        [{ text: 'OK' }]
      );

      return { success: true };
    } catch (err: any) {
      const message = err.message || 'Error requesting password recovery';
      setError(message);
      Alert.alert('Error', message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    handleSignIn,
    handleSignUp,
    handleSignOut,
    handleForgotPassword,
    clearError,
  };
}
