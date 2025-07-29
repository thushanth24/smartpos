import rateLimit from 'express-rate-limit';
import envConfig from '../config/env.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

/**
 * Rate limiting middleware to limit repeated requests to public APIs and endpoints
 */
const rateLimiter = rateLimit({
  windowMs: envConfig.rateLimit.windowMs,
  max: envConfig.rateLimit.max,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and in development
    return envConfig.env === 'development' || req.originalUrl === '/health';
  },
  handler: (req, res, next, options) => {
    const error = new ApiError(
      httpStatus.TOO_MANY_REQUESTS,
      options.message,
      'rate_limit_exceeded',
      true
    );
    
    logger.warn(`Rate limit exceeded for IP: ${req.ip} at ${req.originalUrl}`);
    
    // Format the response according to our error handler
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: {
        code: error.code,
        message: error.message,
        ...(envConfig.env === 'development' && { stack: error.stack }),
      },
      requestId: req.id,
    });
  },
  keyGenerator: (req) => {
    // Use client IP and user ID (if authenticated) as the rate limit key
    return req.user ? `${req.user.id}_${req.ip}` : req.ip;
  },
});

export { rateLimiter };

export default rateLimiter;
