import { verifyToken } from '../utils/jwt.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/user.model.js';

/**
 * Middleware to authenticate requests using JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from the token
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account has been deactivated' 
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: error.message || 'Invalid or expired token' 
    });
  }
};

/**
 * Middleware to authorize user roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware function
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to perform this action' 
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is the owner of the resource
 * @param {string} modelName - Name of the model to check ownership
 * @param {string} [idParam='id'] - Name of the route parameter containing the resource ID
 * @returns {Function} Express middleware function
 */
export const checkOwnership = (modelName, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const Model = (await import(`../models/${modelName}.model.js`)).default;
      const resource = await Model.findByPk(req.params[idParam]);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Allow admins to access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if the user is the owner of the resource
      if (resource.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this resource'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking resource ownership'
      });
    }
  };
};

export default {
  authenticate,
  authorize,
  checkOwnership
};
