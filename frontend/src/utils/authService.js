import api from './api';
import { setToken, setUser, clearAuth, getToken } from './auth';
import { isTokenExpired } from './authUtils';

const authService = {
  getSession: async () => {
    try {
      const data = await api.get('/auth/me');
      return { success: true, data };
    } catch (error) {
      clearAuth();
      return {
        success: false,
        error: error.message || 'Failed to get session',
      };
    }
  },

  signIn: async (email, password) => {
    console.log('[AuthService] Starting sign in process');
    console.log('[AuthService] Email:', email);

    try {
      console.log('[AuthService] Sending login request to /auth/login');
      const responseData = await api.post('/auth/login', { email, password });

      console.log('[AuthService] Response data:', responseData);

      if (!responseData || Object.keys(responseData).length === 0) {
        console.error('[AuthService] Empty response data');
        return {
          success: false,
          error: 'No data received from server',
        };
      }

      const { token, user, success } = responseData;

      if (!success) {
        console.error('[AuthService] Login failed:', responseData.message || 'Unknown error');
        return {
          success: false,
          error: responseData.message || 'Login failed',
          data: responseData,
        };
      }

      if (!token || !user) {
        console.error('[AuthService] Missing token or user data');
        return {
          success: false,
          error: 'Authentication failed: Invalid response format',
          data: responseData,
        };
      }

      setToken(token);
      setUser(user);

      console.log('[AuthService] Successfully authenticated user:', {
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        success: true,
        token,
        user,
        data: responseData,
      };
    } catch (error) {
      console.error('[AuthService] Sign in error:', {
        message: error.message,
        response: error.response,
        status: error.status,
      });

      return {
        success: false,
        error: error.message || 'Failed to sign in',
        details: error,
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

      const { token, user } = data;

      setToken(token);
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
      const token = getToken();
      if (!token) return { success: false, error: 'No token found' };

      const data = await api.post('/auth/refresh-token', { token });
      if (data?.token) {
        setToken(data.token);
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
