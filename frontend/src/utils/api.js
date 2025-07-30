import axios from 'axios';
import { getToken, removeToken, removeUser } from './auth';
import { handleApiError, handleAuthError } from './errorHandler';
import config from '../config';

// Create axios instance with minimal configuration
const api = axios.create({
  baseURL: config.api.baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,  // Important for sending cookies with requests
  timeout: config.api.timeout,
  responseType: 'json',
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the request
    console.log('[API] Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      params: config.params
    });
    
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    // Log the full response for debugging
    console.log('[API] Full response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config: {
        url: response.config.url,
        method: response.config.method,
      },
      data: response.data
    });
    
    // Return the full response to preserve all data
    return response;
  },
  (error) => {
    // For errors, log them and rethrow
    const errorInfo = {
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
      },
    };

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorInfo.response = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      };
    } else if (error.request) {
      // The request was made but no response was received
      errorInfo.request = 'No response received';
    }

    console.error('[API] Request failed:', errorInfo);
    
    // Return a rejected promise with the error
    return Promise.reject(error.response?.data || error.message);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // You can add any response transformation here if needed
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      error.message = 'Unable to connect to the server. Please check your internet connection.';
      return Promise.reject(error);
    }

    // Handle token expiration or invalid token
    if (error.response.status === 401) {
      removeToken();
      removeUser();
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      error.message = 'Your session has expired. Please log in again.';
    }

    // Handle other errors
    error.message = handleApiError(error, error.message || 'An error occurred');
    
    return Promise.reject(error);
  }
);

/**
 * Make an API request with error handling
 * @param {string} method - HTTP method (get, post, put, delete, etc.)
 * @param {string} url - API endpoint
 * @param {object} data - Request data (for POST, PUT, PATCH)
 * @param {object} params - URL parameters
 * @param {object} headers - Additional headers
 * @returns {Promise} - Resolves with response data or rejects with error
 */
const request = async ({
  method = 'get',
  url,
  data = null,
  params = null,
  headers = {},
  ...config
}) => {
  try {
    const response = await api({
      method,
      url,
      data,
      params,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...config,
    });

    return response.data;
  } catch (error) {
    // Log error for debugging
    console.error('API Request Error:', {
      url,
      method,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Re-throw the error with a user-friendly message
    error.userMessage = error.message;
    throw error;
  }
};

// Helper methods for common HTTP methods
const http = {
  get: (url, params = {}, config = {}) =>
    request({ method: 'get', url, params, ...config }),
  post: (url, data = {}, config = {}) =>
    request({ method: 'post', url, data, ...config }),
  put: (url, data = {}, config = {}) =>
    request({ method: 'put', url, data, ...config }),
  patch: (url, data = {}, config = {}) =>
    request({ method: 'patch', url, data, ...config }),
  delete: (url, config = {}) =>
    request({ method: 'delete', url, ...config }),
};

export { http as default, request, handleApiError, handleAuthError };
