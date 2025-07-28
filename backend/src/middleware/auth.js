const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { User } = require('../models');

/**
 * Protect routes with JWT authentication
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header or cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      // Get token from cookie
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return next(
        new ApiError(401, 'Not authorized to access this route')
      );
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (err) {
      return next(new ApiError(401, 'Not authorized, token failed'));
    }
  } catch (err) {
    return next(new ApiError(401, 'Not authorized, no token'));
  }
};

/**
 * Authorize roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `User role ${req.user.role} is not authorized to access this route`
        )
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
