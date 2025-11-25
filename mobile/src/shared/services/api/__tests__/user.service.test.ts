/**
 * Tests for user.service
 */

import { updateUser, updatePassword, deleteUser, getProfile } from '../user.service';
import { apiClient } from '../client';

// Mock the API client
jest.mock('../client', () => ({
  apiClient: {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockUser = {
  id: '1',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('user.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should fetch user profile', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: {
          data: { user: mockUser },
          message: 'Success',
        },
      });

      const result = await getProfile();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/users/me');
      expect(result).toEqual(mockUser);
    });

    it('should throw error on failure', async () => {
      const error = new Error('Network error');
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(getProfile()).rejects.toThrow('Network error');
    });
  });

  describe('updateUser', () => {
    const updateData = {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
    };

    it('should update user profile', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      (apiClient.patch as jest.Mock).mockResolvedValue({
        data: {
          data: { user: updatedUser },
          message: 'Profile updated',
        },
      });

      const result = await updateUser(updateData);

      expect(apiClient.patch).toHaveBeenCalledWith('/api/v1/users/me', {
        user: updateData,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should update only provided fields', async () => {
      const partialUpdate = { first_name: 'Jane' };
      (apiClient.patch as jest.Mock).mockResolvedValue({
        data: {
          data: { user: { ...mockUser, first_name: 'Jane' } },
          message: 'Profile updated',
        },
      });

      await updateUser(partialUpdate);

      expect(apiClient.patch).toHaveBeenCalledWith('/api/v1/users/me', {
        user: partialUpdate,
      });
    });

    it('should throw error on validation failure', async () => {
      const error = new Error('Email is invalid');
      (apiClient.patch as jest.Mock).mockRejectedValue(error);

      await expect(updateUser({ email: 'invalid' })).rejects.toThrow('Email is invalid');
    });
  });

  describe('updatePassword', () => {
    const passwordData = {
      current_password: 'oldPassword123',
      password: 'newPassword123',
      password_confirmation: 'newPassword123',
    };

    it('should update password', async () => {
      (apiClient.patch as jest.Mock).mockResolvedValue({
        data: { message: 'Password updated successfully' },
      });

      const result = await updatePassword(passwordData);

      expect(apiClient.patch).toHaveBeenCalledWith('/api/v1/users/password', {
        user: passwordData,
      });
      expect(result).toEqual({ message: 'Password updated successfully' });
    });

    it('should throw error on wrong current password', async () => {
      const error = new Error('Current password is incorrect');
      (apiClient.patch as jest.Mock).mockRejectedValue(error);

      await expect(updatePassword(passwordData)).rejects.toThrow('Current password is incorrect');
    });

    it('should throw error when passwords do not match', async () => {
      const mismatchedData = {
        ...passwordData,
        password_confirmation: 'differentPassword',
      };
      const error = new Error('Passwords do not match');
      (apiClient.patch as jest.Mock).mockRejectedValue(error);

      await expect(updatePassword(mismatchedData)).rejects.toThrow('Passwords do not match');
    });
  });

  describe('deleteUser', () => {
    it('should delete user account', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({
        data: { message: 'Account deleted successfully' },
      });

      const result = await deleteUser();

      expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/users/me');
      expect(result).toEqual({ message: 'Account deleted successfully' });
    });

    it('should throw error on failure', async () => {
      const error = new Error('Could not delete account');
      (apiClient.delete as jest.Mock).mockRejectedValue(error);

      await expect(deleteUser()).rejects.toThrow('Could not delete account');
    });
  });
});
