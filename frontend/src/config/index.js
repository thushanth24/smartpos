/**
 * Application configuration
 * This file centralizes all environment variables and configuration settings
 */

const config = {
  // API Configuration
  api: {
    // Base URL for API requests
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    
    // Default request timeout in milliseconds
    timeout: 30000, // 30 seconds
    
    // API version
    version: 'v1',
  },
  
  // Application settings
  app: {
    // Application name
    name: import.meta.env.VITE_APP_NAME || 'SmartPOS',
    
    // Default language
    defaultLanguage: 'en',
    
    // Theme configuration
    theme: {
      primaryColor: '#4F46E5',
      secondaryColor: '#7C3AED',
      darkMode: false,
    },
    
    // Feature flags
    features: {
      darkMode: true,
      notifications: true,
      analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    },
  },
  
  // Authentication configuration
  auth: {
    // Token storage key
    tokenKey: 'auth_token',
    
    // User data storage key
    userKey: 'user_data',
    
    // Token refresh interval in milliseconds (15 minutes)
    refreshInterval: 15 * 60 * 1000,
    
    // Session timeout in milliseconds (24 hours)
    sessionTimeout: 24 * 60 * 60 * 1000,
  },
  
  // Local storage keys
  storageKeys: {
    theme: 'app_theme',
    language: 'app_language',
    recentSearches: 'recent_searches',
    cart: 'cart_items',
  },
  
  // Pagination defaults
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  },
  
  // Date and time formats
  formats: {
    date: 'YYYY-MM-DD',
    time: 'HH:mm',
    dateTime: 'YYYY-MM-DD HH:mm',
    displayDate: 'MMM D, YYYY',
    displayTime: 'h:mm A',
    displayDateTime: 'MMM D, YYYY h:mm A',
  },
  
  // Currency configuration
  currency: {
    code: 'USD',
    symbol: '$',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
  },
  
  // Environment detection
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  isTest: import.meta.env.NODE_ENV === 'test',
};

/**
 * Get a nested configuration value using dot notation
 * @param {string} path - Path to the config value (e.g., 'app.name')
 * @param {*} defaultValue - Default value if the path doesn't exist
 * @returns {*} The configuration value or default value
 */
const getConfig = (path, defaultValue = null) => {
  const parts = path.split('.');
  let current = config;
  
  for (const part of parts) {
    if (current[part] === undefined) {
      return defaultValue;
    }
    current = current[part];
  }
  
  return current !== undefined ? current : defaultValue;
};

export default {
  ...config,
  get: getConfig,
};
