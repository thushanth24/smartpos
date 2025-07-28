import api from './api';
import { setToken, setUser, clearAuth, getUser } from './auth';

const authService = {
  // Get current session
  getSession: async () => {
    try {
      const response = await api.get('/auth/me');
      return { success: true, data: response.data };
    } catch (error) {
      clearAuth();
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to get session' 
      };
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Store token and user data
      setToken(token);
      setUser(user);
      
      return { success: true, data: user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to sign in' 
      };
    }
  },

  // Sign up with email and password
  signUp: async (email, password, userData = {}) => {
    try {
      const response = await api.post('/auth/register', { 
        email, 
        password,
        fullName: userData.fullName,
        ...userData
      });
      
      const { token, user } = response.data;
      
      // Store token and user data
      setToken(token);
      setUser(user);
      
      return { success: true, data: user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to sign up' 
      };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await api.post('/auth/logout');
      clearAuth();
      return { success: true };
    } catch (error) {
      // Clear auth even if there's an error
      clearAuth();
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to sign out' 
      };
    }
  },

  // Get user profile
  getUserProfile: async () => {
    try {
      const response = await api.get('/users/me');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to get user profile' 
      };
    }
  },

  // Update user profile
  updateUserProfile: async (updates) => {
    try {
      const response = await api.patch('/users/me', updates);
      // Update stored user data
      const user = getUser();
      setUser({ ...user, ...response.data });
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update profile' 
      };
    }
  },

  // Request password reset
  resetPassword: async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send reset email' 
      };
    }
  },

  // Reset password with token
  resetPasswordWithToken: async (token, newPassword) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to reset password' 
      };
    }
  },

  // No direct equivalent for auth state changes - use your app's state management
  // to handle authentication state
};

export default authService;