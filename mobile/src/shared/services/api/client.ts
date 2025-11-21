/**
 * API Client - Axios
 *
 * HTTP client configured with JWT authentication interceptors.
 */

import axios, { type AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

// API URL - adjust based on environment
const API_BASE_URL = __DEV__
  ? 'http://192.168.0.4:3000' // Local development - machine IP on network
  : 'https://api.finance-app.com'; // Production

/**
 * Configured Axios client
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Request interceptor - adds JWT token
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error('Error getting token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handles errors and token refresh
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If 401 error and not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');

        if (refreshToken) {
          // Try to refresh token
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { token } = response.data.data;

          // Save new token
          await SecureStore.setItemAsync('auth_token', token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('refresh_token');
        // TODO: Emit event to redirect to login
        return Promise.reject(refreshError);
      }
    }

    // Extract error message from response
    const message =
      (error.response?.data as any)?.message ||
      error.message ||
      'Unknown error';

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
