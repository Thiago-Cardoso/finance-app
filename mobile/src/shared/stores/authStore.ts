/**
 * Auth Store - Zustand
 *
 * Global store for authentication management.
 * - User and auth state persisted in AsyncStorage
 * - Tokens securely stored in SecureStore
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@/shared/models/User.model';

const AUTH_USER_KEY = '@finance-app:user';
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (token: string, refreshToken: string) => Promise<void>;
  clearTokens: () => Promise<void>;
  login: (user: User, token: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

/**
 * Zustand authentication store
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: true,

  /**
   * Set user
   */
  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  /**
   * Save tokens to SecureStore (encrypted)
   */
  setTokens: async (token, refreshToken) => {
    try {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  },

  /**
   * Remove tokens from SecureStore
   */
  clearTokens: async () => {
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },

  /**
   * Complete login (save user and tokens)
   */
  login: async (user, token, refreshToken) => {
    try {
      // Save tokens to SecureStore
      await get().setTokens(token, refreshToken);

      // Save user to AsyncStorage
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

      // Update state
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  /**
   * Complete logout (clear user and tokens)
   */
  logout: async () => {
    try {
      // Clear tokens
      await get().clearTokens();

      // Clear user from AsyncStorage
      await AsyncStorage.removeItem(AUTH_USER_KEY);

      // Clear state
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  /**
   * Load saved user (on app start)
   */
  loadUser: async () => {
    try {
      set({ isLoading: true });

      // Fetch user from AsyncStorage
      const userJson = await AsyncStorage.getItem(AUTH_USER_KEY);

      // Check if there's a valid token
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);

      if (userJson && token) {
        const user = JSON.parse(userJson) as User;

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // If no user or token, logout
        await get().logout();
      }
    } catch (error) {
      console.error('Error loading user:', error);
      await get().logout();
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Set loading state
   */
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));
