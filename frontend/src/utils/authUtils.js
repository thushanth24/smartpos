import { jwtDecode } from 'jwt-decode';
import config from '../config';

/**
 * Check if a token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired, false otherwise
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // If there's an error, assume token is invalid/expired
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {number|null} - Expiration timestamp in seconds or null if invalid
 */
export const getTokenExpiration = (token) => {
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return decoded.exp || null;
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};

/**
 * Get time remaining until token expiration in milliseconds
 * @param {string} token - JWT token
 * @returns {number} - Time remaining in milliseconds (0 if expired or invalid)
 */
export const getTokenTimeRemaining = (token) => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return 0;
  
  const currentTime = Date.now() / 1000; // Convert to seconds
  const timeRemaining = (expiration - currentTime) * 1000; // Convert to milliseconds
  
  return Math.max(0, timeRemaining);
};

/**
 * Check if user has required role
 * @param {string} requiredRole - Required role
 * @param {object} user - User object with roles
 * @returns {boolean} - True if user has the required role
 */
export const hasRole = (requiredRole, user) => {
  if (!user || !user.roles) return false;
  return user.roles.includes(requiredRole);
};

/**
 * Check if user has any of the required roles
 * @param {Array} requiredRoles - Array of required roles
 * @param {object} user - User object with roles
 * @returns {boolean} - True if user has at least one of the required roles
 */
export const hasAnyRole = (requiredRoles = [], user) => {
  if (!user || !user.roles) return false;
  return requiredRoles.some(role => user.roles.includes(role));
};

/**
 * Check if user has all of the required roles
 * @param {Array} requiredRoles - Array of required roles
 * @param {object} user - User object with roles
 * @returns {boolean} - True if user has all of the required roles
 */
export const hasAllRoles = (requiredRoles = [], user) => {
  if (!user || !user.roles) return false;
  return requiredRoles.every(role => user.roles.includes(role));
};

/**
 * Get user's permissions from token
 * @param {string} token - JWT token
 * @returns {Array} - Array of permissions
 */
export const getPermissionsFromToken = (token) => {
  if (!token) return [];
  
  try {
    const decoded = jwtDecode(token);
    return decoded.permissions || [];
  } catch (error) {
    console.error('Error getting permissions from token:', error);
    return [];
  }
};

/**
 * Check if user has a specific permission
 * @param {string} permission - Required permission
 * @param {object} user - User object
 * @returns {boolean} - True if user has the required permission
 */
export const hasPermission = (permission, user) => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

/**
 * Check if user has any of the required permissions
 * @param {Array} permissions - Array of required permissions
 * @param {object} user - User object
 * @returns {boolean} - True if user has at least one of the required permissions
 */
export const hasAnyPermission = (permissions = [], user) => {
  if (!user || !user.permissions) return false;
  return permissions.some(perm => user.permissions.includes(perm));
};

/**
 * Get auth headers with token
 * @param {string} token - JWT token
 * @returns {object} - Headers object with Authorization header
 */
export const getAuthHeaders = (token) => {
  if (!token) return {};
  
  return {
    'Authorization': `Bearer ${token}`,
    'X-Requested-With': 'XMLHttpRequest',
  };
};
