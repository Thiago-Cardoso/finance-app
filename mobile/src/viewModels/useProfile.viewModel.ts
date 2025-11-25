/**
 * ViewModel: Profile
 *
 * Business logic for profile management.
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '@/shared/stores/authStore';
import * as userService from '@/shared/services/api/user.service';
import { signOut } from '@/shared/services/api/auth.service';
import type { User } from '@/shared/models/User.model';
import type { UpdateUserData, UpdatePasswordData } from '@/shared/services/api/user.service';

interface UseProfileViewModelReturn {
  // State
  user: User | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Profile actions
  updateProfile: (data: UpdateUserData) => Promise<{ success: boolean }>;
  changePassword: (data: UpdatePasswordData) => Promise<{ success: boolean }>;
  refreshProfile: () => Promise<void>;

  // Auth actions
  logout: () => Promise<void>;
  confirmLogout: () => void;

  // Helpers
  getUserInitials: () => string;
  getFullName: () => string;
  clearError: () => void;
}

export function useProfileViewModel(): UseProfileViewModelReturn {
  const { user, setUser, logout: storeLogout } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (data: UpdateUserData): Promise<{ success: boolean }> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedUser = await userService.updateUser(data);
      setUser(updatedUser);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar perfil';
      setError(message);
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }, [setUser]);

  /**
   * Change user password
   */
  const changePassword = useCallback(async (data: UpdatePasswordData): Promise<{ success: boolean }> => {
    setIsSubmitting(true);
    setError(null);

    try {
      await userService.updatePassword(data);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao alterar senha';
      setError(message);
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  /**
   * Refresh user profile from API
   */
  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const freshUser = await userService.getProfile();
      setUser(freshUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar perfil';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  /**
   * Perform logout
   */
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      // Call API to invalidate token
      await signOut();
    } catch (err) {
      // Ignore API errors, still proceed with local logout
      console.error('Erro ao fazer logout na API:', err);
    } finally {
      // Always clear local state
      await storeLogout();
      setIsLoading(false);
    }
  }, [storeLogout]);

  /**
   * Show logout confirmation
   */
  const confirmLogout = useCallback(() => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair? Você precisará fazer login novamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  }, [logout]);

  /**
   * Get user initials for avatar
   */
  const getUserInitials = useCallback((): string => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return '?';

    const firstInitial = currentUser.first_name?.charAt(0)?.toUpperCase() || '';
    const lastInitial = currentUser.last_name?.charAt(0)?.toUpperCase() || '';

    return `${firstInitial}${lastInitial}` || currentUser.email?.charAt(0)?.toUpperCase() || '?';
  }, []);

  /**
   * Get full name
   */
  const getFullName = useCallback((): string => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return '';

    const firstName = currentUser.first_name || '';
    const lastName = currentUser.last_name || '';

    return `${firstName} ${lastName}`.trim() || currentUser.email || '';
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    user,
    isLoading,
    isSubmitting,
    error,

    // Profile actions
    updateProfile,
    changePassword,
    refreshProfile,

    // Auth actions
    logout,
    confirmLogout,

    // Helpers
    getUserInitials,
    getFullName,
    clearError,
  };
}

export default useProfileViewModel;
