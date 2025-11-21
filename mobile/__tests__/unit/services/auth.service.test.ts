/**
 * Auth Service Tests
 *
 * Testes unitários para o serviço de autenticação.
 */

import axios from 'axios';
import * as authService from '@/shared/services/api/auth.service';
import { mockAuthResponse, mockUser, createSuccessResponse } from '../../helpers/mockApi';
import type { SignInData, SignUpData } from '@/shared/models/User.model';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in successfully', async () => {
      const signInData: SignInData = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockedAxios.post.mockResolvedValue(createSuccessResponse(mockAuthResponse));

      const result = await authService.signIn(signInData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', signInData);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw error on invalid credentials', async () => {
      const signInData: SignInData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockedAxios.post.mockRejectedValue({
        response: {
          data: { error: 'Invalid credentials' },
          status: 401,
        },
      });

      await expect(authService.signIn(signInData)).rejects.toMatchObject({
        response: {
          data: { error: 'Invalid credentials' },
        },
      });
    });
  });

  describe('signUp', () => {
    it('should sign up successfully', async () => {
      const signUpData: SignUpData = {
        email: 'newuser@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        first_name: 'New',
        last_name: 'User',
      };

      mockedAxios.post.mockResolvedValue(createSuccessResponse(mockAuthResponse));

      const result = await authService.signUp(signUpData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/register', signUpData);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw error on duplicate email', async () => {
      const signUpData: SignUpData = {
        email: 'existing@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        first_name: 'New',
        last_name: 'User',
      };

      mockedAxios.post.mockRejectedValue({
        response: {
          data: { error: 'Email already exists' },
          status: 400,
        },
      });

      await expect(authService.signUp(signUpData)).rejects.toMatchObject({
        response: {
          data: { error: 'Email already exists' },
        },
      });
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockedAxios.post.mockResolvedValue(createSuccessResponse({}));

      await authService.signOut();

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email successfully', async () => {
      const email = 'test@example.com';

      mockedAxios.post.mockResolvedValue(createSuccessResponse({}));

      await authService.forgotPassword(email);

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email,
      });
    });

    it('should throw error on non-existent email', async () => {
      const email = 'nonexistent@example.com';

      mockedAxios.post.mockRejectedValue({
        response: {
          data: { error: 'User not found' },
          status: 404,
        },
      });

      await expect(authService.forgotPassword(email)).rejects.toMatchObject({
        response: {
          data: { error: 'User not found' },
        },
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      mockedAxios.get.mockResolvedValue(createSuccessResponse(mockUser));

      const result = await authService.getCurrentUser();

      expect(mockedAxios.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });

    it('should throw error on unauthorized', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          data: { error: 'Unauthorized' },
          status: 401,
        },
      });

      await expect(authService.getCurrentUser()).rejects.toMatchObject({
        response: {
          data: { error: 'Unauthorized' },
        },
      });
    });
  });

  describe('refreshAuthToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'fake-refresh-token';
      const newAuthResponse = {
        ...mockAuthResponse,
        token: 'new-fake-jwt-token',
      };

      mockedAxios.post.mockResolvedValue(createSuccessResponse(newAuthResponse));

      const result = await authService.refreshAuthToken(refreshToken);

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/refresh', {
        refresh_token: refreshToken,
      });
      expect(result).toEqual(newAuthResponse);
    });

    it('should throw error on invalid refresh token', async () => {
      const refreshToken = 'invalid-token';

      mockedAxios.post.mockRejectedValue({
        response: {
          data: { error: 'Invalid refresh token' },
          status: 401,
        },
      });

      await expect(authService.refreshAuthToken(refreshToken)).rejects.toMatchObject({
        response: {
          data: { error: 'Invalid refresh token' },
        },
      });
    });
  });
});
