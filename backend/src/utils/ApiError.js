/**
 * Custom error class for handling API errors
 * @extends Error
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {boolean} [isOperational=true] - Whether the error is operational
   * @param {string} [stack=''] - Error stack trace
   */
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Create a bad request error (400)
   * @param {string} message - Error message
   * @returns {ApiError} Bad request error
   */
  static badRequest(message) {
    return new ApiError(400, message);
  }

  /**
   * Create an unauthorized error (401)
   * @param {string} [message='Unauthorized'] - Error message
   * @returns {ApiError} Unauthorized error
   */
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  /**
   * Create a forbidden error (403)
   * @param {string} [message='Forbidden'] - Error message
   * @returns {ApiError} Forbidden error
   */
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  /**
   * Create a not found error (404)
   * @param {string} [message='Resource not found'] - Error message
   * @returns {ApiError} Not found error
   */
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  /**
   * Create an internal server error (500)
   * @param {string} [message='Internal server error'] - Error message
   * @param {string} [stack=''] - Error stack trace
   * @returns {ApiError} Internal server error
   */
  static internal(message = 'Internal server error', stack = '') {
    return new ApiError(500, message, true, stack);
  }
}

export default ApiError;
