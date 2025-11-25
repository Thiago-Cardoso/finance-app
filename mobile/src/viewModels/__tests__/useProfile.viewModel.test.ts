/**
 * Tests for useProfile.viewModel
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useProfileViewModel } from '../useProfile.viewModel';
import * as userService from '@/shared/services/api/user.service';
import * as authService from '@/shared/services/api/auth.service';
import { useAuthStore } from '@/shared/stores/authStore';


// Mock the services
jest.mock('@/shared/services/api/user.service', () => ({
  updateUser: jest.fn(),
  updatePassword: jest.fn(),
  getProfile: jest.fn(),
}));

jest.mock('@/shared/services/api/auth.service', () => ({
  signOut: jest.fn(),
}));

// Mock auth store
const mockUser = {
  id: '1',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockSetUser = jest.fn();
const mockLogout = jest.fn();

jest.mock('@/shared/stores/authStore', () => ({
  useAuthStore: jest.fn(() => ({
    user: mockUser,
    setUser: mockSetUser,
    logout: mockLogout,
  })),
}));

describe('useProfileViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as jest.Mock).mockReturnValue({
      user: mockUser,
      setUser: mockSetUser,
      logout: mockLogout,
    });
  });

  describe('initial state', () => {
    it('should return initial state with user from store', () => {
      const { result } = renderHook(() => useProfileViewModel());

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('getUserInitials', () => {
    it('should return initials from first and last name', () => {
      const { result } = renderHook(() => useProfileViewModel());

      expect(result.current.getUserInitials()).toBe('JD');
    });

    it('should return email initial when name is missing', () => {
      (useAuthStore as jest.Mock).mockReturnValue({
        user: { ...mockUser, first_name: '', last_name: '' },
        setUser: mockSetUser,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useProfileViewModel());

      expect(result.current.getUserInitials()).toBe('T');
    });

    it('should return ? when user is null', () => {
      (useAuthStore as jest.Mock).mockReturnValue({
        user: null,
        setUser: mockSetUser,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useProfileViewModel());

      expect(result.current.getUserInitials()).toBe('?');
    });
  });

  describe('getFullName', () => {
    it('should return full name', () => {
      const { result } = renderHook(() => useProfileViewModel());

      expect(result.current.getFullName()).toBe('John Doe');
    });

    it('should return email when name is missing', () => {
      (useAuthStore as jest.Mock).mockReturnValue({
        user: { ...mockUser, first_name: '', last_name: '' },
        setUser: mockSetUser,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useProfileViewModel());

      expect(result.current.getFullName()).toBe('test@example.com');
    });

    it('should return empty string when user is null', () => {
      (useAuthStore as jest.Mock).mockReturnValue({
        user: null,
        setUser: mockSetUser,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useProfileViewModel());

      expect(result.current.getFullName()).toBe('');
    });
  });

  describe('updateProfile', () => {
    const updateData = {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
    };

    it('should update profile successfully', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      (userService.updateUser as jest.Mock).mockResolvedValue(updatedUser);

      const { result } = renderHook(() => useProfileViewModel());

      let updateResult: { success: boolean };
      await act(async () => {
        updateResult = await result.current.updateProfile(updateData);
      });

      expect(updateResult!.success).toBe(true);
      expect(userService.updateUser).toHaveBeenCalledWith(updateData);
      expect(mockSetUser).toHaveBeenCalledWith(updatedUser);
      expect(result.current.error).toBeNull();
    });

    it('should handle update error', async () => {
      const errorMessage = 'Erro ao atualizar perfil';
      (userService.updateUser as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useProfileViewModel());

      let updateResult: { success: boolean };
      await act(async () => {
        updateResult = await result.current.updateProfile(updateData);
      });

      expect(updateResult!.success).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should set isSubmitting during update', async () => {
      (userService.updateUser as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useProfileViewModel());

      expect(result.current.isSubmitting).toBe(false);

      act(() => {
        result.current.updateProfile(updateData);
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(true);
      });
    });
  });

  describe('changePassword', () => {
    const passwordData = {
      current_password: 'oldPassword123',
      password: 'newPassword123',
      password_confirmation: 'newPassword123',
    };

    it('should change password successfully', async () => {
      (userService.updatePassword as jest.Mock).mockResolvedValue({ message: 'Senha alterada' });

      const { result } = renderHook(() => useProfileViewModel());

      let changeResult: { success: boolean };
      await act(async () => {
        changeResult = await result.current.changePassword(passwordData);
      });

      expect(changeResult!.success).toBe(true);
      expect(userService.updatePassword).toHaveBeenCalledWith(passwordData);
      expect(result.current.error).toBeNull();
    });

    it('should handle password change error', async () => {
      const errorMessage = 'Senha atual incorreta';
      (userService.updatePassword as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useProfileViewModel());

      let changeResult: { success: boolean };
      await act(async () => {
        changeResult = await result.current.changePassword(passwordData);
      });

      expect(changeResult!.success).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('refreshProfile', () => {
    it('should refresh profile from API', async () => {
      const freshUser = { ...mockUser, first_name: 'Updated' };
      (userService.getProfile as jest.Mock).mockResolvedValue(freshUser);

      const { result } = renderHook(() => useProfileViewModel());

      await act(async () => {
        await result.current.refreshProfile();
      });

      expect(userService.getProfile).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith(freshUser);
    });

    it('should handle refresh error', async () => {
      const errorMessage = 'Erro ao carregar perfil';
      (userService.getProfile as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useProfileViewModel());

      await act(async () => {
        await result.current.refreshProfile();
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('logout', () => {
    it('should call signOut and store logout', async () => {
      (authService.signOut as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useProfileViewModel());

      await act(async () => {
        await result.current.logout();
      });

      expect(authService.signOut).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
    });

    it('should still logout locally even if API call fails', async () => {
      (authService.signOut as jest.Mock).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useProfileViewModel());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('confirmLogout', () => {
    it('should call confirmLogout without error', () => {
      const { result } = renderHook(() => useProfileViewModel());

      // Just ensure it doesn't throw
      expect(() => {
        act(() => {
          result.current.confirmLogout();
        });
      }).not.toThrow();
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      (userService.updateUser as jest.Mock).mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useProfileViewModel());

      await act(async () => {
        await result.current.updateProfile({ first_name: 'Test' });
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
