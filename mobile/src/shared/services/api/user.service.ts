/**
 * User Service
 *
 * Services for managing user profile and settings.
 */

import { apiClient } from './client';
import type { User } from '@/shared/models/User.model';

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface UpdatePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

interface UserResponse {
  data: {
    user: User;
  };
  message: string;
}

/**
 * Update user profile
 */
export async function updateUser(data: UpdateUserData): Promise<User> {
  const response = await apiClient.patch<UserResponse>('/api/v1/users/me', {
    user: data,
  });

  return response.data.data.user;
}

/**
 * Update user password
 */
export async function updatePassword(data: UpdatePasswordData): Promise<{ message: string }> {
  const response = await apiClient.patch<{ message: string }>('/api/v1/auth/change_password', {
    user: data,
  });

  return response.data;
}

/**
 * Delete user account
 */
export async function deleteUser(): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>('/api/v1/users/me');

  return response.data;
}

/**
 * Get user profile
 */
export async function getProfile(): Promise<User> {
  const response = await apiClient.get<UserResponse>('/api/v1/users/me');

  return response.data.data.user;
}

export default {
  updateUser,
  updatePassword,
  deleteUser,
  getProfile,
};
