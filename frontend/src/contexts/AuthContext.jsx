import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../utils/authService';
import { getToken, getUser, setUser as setStoredUser, setToken as setStoredToken, removeToken, removeUser } from '../utils/auth';
import { isTokenExpired, getTokenTimeRemaining } from '../utils/authUtils';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

    // Refresh token
    const refreshToken = useCallback(async () => {
      try {
        const result = await authService.refreshToken();
        if (result.success) {
          setToken(result.data.token);
          setUser(result.data.user);
          setStoredUser(result.data.user);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error refreshing token:', error);
        return false;
      }
    }, []);


  
    const fetchUserProfile = useCallback(async () => {
      try {
        const result = await authService.getUserProfile();
        if (result.success) {
          const updatedUser = (prevUser) => {
            const merged = { ...prevUser, ...result.data };
            setStoredUser(merged);
            return merged;
          };
    
          setUser(updatedUser); // pass updater function
          return true;
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user profile');
        return false;
      }
    }, []); // ✅ no user dependency
    
  

  
  // Clear authentication state
  const clearAuth = useCallback(() => {
    removeToken();
    removeUser();
    setUser(null);
    setToken(null);
    setError(null);
  }, []);
  
  // Initialize authentication state
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
  
      const storedToken = getToken();
      const storedUser = getUser();
  
      if (!storedToken || !storedUser) {
        clearAuth(); // ✅ Clear old junk
        return false;
      }
  
      if (isTokenExpired(storedToken)) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          clearAuth();
          return false;
        }
        return true; // ✅ Stop here if token was refreshed & user already set
      }
  
      // Token is valid — set initial state
      setUser(storedUser);
      setToken(storedToken);
  
      const profileFetched = await fetchUserProfile();
      if (!profileFetched) {
        clearAuth(); // ✅ Clear state on failure
        return false;
      }
  
      return true;
    } catch (error) {
      console.error('[AuthContext] Error during init:', error);
      clearAuth(); // ✅ Reset everything
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshToken, fetchUserProfile, clearAuth]);
  

  // Login function
  const login = useCallback(
    async (email, password) => {
      console.log('[AuthContext] Login initiated for email:', email);
      setLoading(true);
      setError(null);

      try {
        console.log('[AuthContext] Calling authService.signIn');
        const result = await authService.signIn(email, password);
        console.log('[AuthContext] authService.signIn result:', result);

        if (result && result.success) {
          console.log('[AuthContext] Login successful, updating state');
          
          const { token, user } = result;
          
          if (!token || !user) {
            console.error('[AuthContext] Missing token or user in response');
            throw new Error('Invalid response from server: Missing token or user data');
          }
          
          // Update state
          setUser(user);
          setToken(token);
          
          // Store in local storage
          setStoredToken(token);
          setStoredUser(user);
          
          // Navigate to the originally requested page or home
          const targetPath = location.state?.from?.pathname || '/';
          console.log('[AuthContext] Navigating to:', targetPath);
          navigate(targetPath, { replace: true });
          
          return { success: true };
        } else {
          // Handle API-level errors (e.g., invalid credentials)
          const errorMessage = (result && result.error) || 'Login failed. Please try again.';
          console.error('[AuthContext] Login failed:', errorMessage, { result });
          setError(errorMessage);
          return { 
            success: false, 
            error: errorMessage,
            data: result?.data 
          };
        }
      } catch (err) {
        console.error('[AuthContext] Error during login:', {
          message: err.message,
          stack: err.stack,
          response: err.response?.data,
          status: err.response?.status
        });
        
        const errorMessage = err.response?.data?.message || 
                           err.message || 
                           'Failed to log in. Please check your credentials.';
        
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        console.log('[AuthContext] Login process completed');
        setLoading(false);
      }
    },
    [navigate, location.state]
  );
  
  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      navigate('/login');
    }
  }, [clearAuth, navigate]);
  
  // Register function
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Format the data for the registration API
      const registrationData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        companyName: userData.companyName || '',
        role: userData.role || 'cashier',
        password: userData.password
      };
      
      // Call the auth service to register the user
      const result = await authService.register(registrationData);
      
      if (result.success) {
        // If auto-login is desired after registration
        // return await login(userData.email, userData.password);
        
        // Otherwise, just return success
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Registration failed. Please try again.');
        return { 
          success: false, 
          error: result.error || 'Registration failed. Please try again.' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred during registration. Please try again.';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  }, [login]);
  
  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.updateUserProfile(updates);
      
      if (result.success) {
        setUser(prev => ({
          ...prev,
          ...result.data
        }));
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to update profile');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Initialize auth on mount
  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      await initializeAuth();
      if (isMounted) {
        setLoading(false);
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
    };
  }, [initializeAuth]);
  
  // Set up token refresh interval
  useEffect(() => {
    if (!token) return;
    
    const timeUntilRefresh = getTokenTimeRemaining(token) - 300000; // 5 minutes before expiration
    
    if (timeUntilRefresh <= 0) {
      // If token is about to expire, refresh it immediately
      refreshToken();
      return;
    }
    
    const refreshTimer = setTimeout(() => {
      refreshToken();
    }, timeUntilRefresh);
    
    return () => clearTimeout(refreshTimer);
  }, [token, refreshToken]);

  // Provide the auth context value
  const value = {
    user,
    loading,
    error,
    token,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateProfile,
    refreshToken,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;