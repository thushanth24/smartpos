const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Convert error to ApiError if needed
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
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    statusCode = 500; // Internal Server Error
    message = 'Internal Server Error';
  }

  res.locals.errorMessage = err.message;

  const response = {
    status: statusCode < 500 ? 'fail' : 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  if (process.env.NODE_ENV === 'development') {
    logger.error(err);
  }

  res.status(statusCode).json(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
