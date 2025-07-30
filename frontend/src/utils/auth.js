// Token storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Save token to localStorage
export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

// Alias for setToken for consistency
export const setStoredToken = setToken;

// Get token from localStorage
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

// Remove token from localStorage
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// Save user data to localStorage
export const setUser = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

// Get user data from localStorage
export const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }
  return null;
};

// Remove user data from localStorage
export const removeUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY);
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Clear all auth data
export const clearAuth = () => {
  removeToken();
  removeUser();
};
