import api from './api';
import {
  setToken,
  setRefreshToken,
  setUser,
  clearAuth,
  getToken,
  getRefreshToken
} from './auth';
import { isTokenExpired } from './authUtils';

const authService = {
  getUserProfile: async () => {
    try {
      const response = await api.get('/users/me');
      return { success: true, data: response.data };
    } catch (err) {
      console.warn('[authService] getUserProfile failed:', err.response?.status, err.message);
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to fetch user profile'
      };
    }
  },

  signIn: async (email, password) => {
    console.log('[AuthService] Starting sign in process');
    console.log('[AuthService] Email:', email);

    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('[AuthService] Response data:', response);

      // ✅ Check if token and user exist
      if (!response.token || !response.user) {
        console.error('[AuthService] Missing token, user data');
        return {
          success: false,
          error: 'Authentication failed: Invalid response format',
          data: response
        };
      }

      // ✅ Return token and user in expected structure
      return {
        success: true,
        token: response.token,
        user: response.user
      };
    } catch (error) {
      console.error('[AuthService] Sign in error:', error);
      return {
        success: false,
        error: error?.userMessage || error?.message || 'Login failed',
        data: error
      };
    }
  },
  signUp: async (email, password, userData = {}) => {
    try {
      const data = await api.post('/auth/register', {
        email,
        password,
        fullName: userData.fullName,
        ...userData,
      });

      const { token, refreshToken, user } = data;

      setToken(token);
      setRefreshToken(refreshToken);
      setUser(user);

      return { success: true, data: user };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to sign up',
      };
    }
  },

  signOut: async () => {
    try {
      await api.post('/auth/logout');
      clearAuth();
      return { success: true };
    } catch (error) {
      clearAuth();
      return {
        success: false,
        error: error.message || 'Failed to sign out',
      };
    }
  },

  getUserProfile: async () => {
    try {
      const data = await api.get('/users/me');
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get user profile',
      };
    }
  },

  updateUserProfile: async (updates) => {
    try {
      const data = await api.patch('/users/me', updates);
      const user = getUser();
      setUser({ ...user, ...data });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to update profile',
      };
    }
  },

  resetPassword: async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to send reset email',
      };
    }
  },

  resetPasswordWithToken: async (token, newPassword) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to reset password',
      };
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = getRefreshToken(); // ✅ Get correct token
      if (!refreshToken) {
        return { success: false, error: 'No refresh token found' };
      }

      const data = await api.post('/auth/refresh-token', { refreshToken }); // ✅ Correct payload

      if (data?.token) {
        setToken(data.token);
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken); // optional: update if new one issued
        }

        return { success: true, token: data.token };
      }

      return { success: false, error: 'Failed to refresh token' };
    } catch (error) {
      console.error('[AuthService] Refresh token error:', error);
      return { success: false, error: error.message };
    }
  },
};

export default authService;
