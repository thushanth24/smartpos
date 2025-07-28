import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Convert error to ApiError if needed
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const errorConverter = (err, req, res, next) => {
  let error = err;
  
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }
  
  next(error);
};

/**
 * Handle errors and send response
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  
  // In production, don't leak error details
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    statusCode = 500; // Internal Server Error
    message = 'Internal Server Error';
  }

  // Set response locals for error page rendering (if needed)
  res.locals.errorMessage = message;

  // Prepare error response
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: {
        name: err.name,
        message: err.message,
        ...(err.errors && { errors: err.errors })
      }
    }),
  };

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    logger.error(`[${new Date().toISOString()}] ${err.stack || err}`);
  } else if (process.env.NODE_ENV === 'production') {
    logger.error(`[${new Date().toISOString()}] ${err.message}`);
  }

  // Send error response
  res.status(statusCode || 500).json(response);
};

/**
 * Handle 404 errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

export { errorConverter, errorHandler, notFound };

export default {
  errorConverter,
  errorHandler,
  notFound
};
