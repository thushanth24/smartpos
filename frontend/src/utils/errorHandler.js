/**
 * Handles API errors consistently across the application
 * @param {Error} error - The error object from the API call
 * @param {string} defaultMessage - Default error message if none is provided
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  // Handle network errors
  if (!error.response) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  // Handle HTTP errors
  const { status, data } = error.response;
  
  switch (status) {
    case 400:
      return data?.message || 'Invalid request. Please check your input.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred. This item may have been modified by another user.';
    case 500:
      return 'An internal server error occurred. Please try again later.';
    default:
      return data?.message || defaultMessage;
  }
};

/**
 * Handles form validation errors
 * @param {object} errors - The errors object from form validation
 * @returns {object} Processed errors object
 */
export const handleValidationErrors = (errors) => {
  const result = {};
  
  if (!errors) return result;
  
  // Handle Yup validation errors
  if (errors.inner) {
    errors.inner.forEach((error) => {
      result[error.path] = error.message;
    });
    return result;
  }
  
  // Handle API validation errors
  if (Array.isArray(errors)) {
    errors.forEach((error) => {
      result[error.field] = error.message;
    });
    return result;
  }
  
  // Handle simple object errors
  return errors;
};

/**
 * Handles authentication errors
 * @param {Error} error - The error object
 * @returns {string} User-friendly authentication error message
 */
export const handleAuthError = (error) => {
  if (!error.response) {
    return 'Unable to connect to the authentication server. Please check your internet connection.';
  }
  
  const { status, data } = error.response;
  
  switch (status) {
    case 400:
      return 'Invalid email or password.';
    case 401:
      return 'Invalid credentials. Please check your email and password.';
    case 403:
      return 'Your account is not active. Please contact support.';
    case 404:
      return 'No account found with this email address.';
    case 429:
      return 'Too many login attempts. Please try again later.';
    default:
      return data?.message || 'An authentication error occurred. Please try again.';
  }
};
