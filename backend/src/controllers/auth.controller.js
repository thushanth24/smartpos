const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Create and send token
const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user.id);
  
  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { email, password, full_name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return next(new ApiError(400, 'Email already in use'));
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      full_name,
      role: role || 'cashier'
    });

    createSendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new ApiError(400, 'Please provide email and password'));
    }

    // 2) Check if user exists && password is correct
    const user = await User.findByEmail(email);
    
    if (!user || !(await User.isPasswordMatch(user, password))) {
      return next(new ApiError(401, 'Incorrect email or password'));
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const { full_name, email } = req.body;
    const user = await User.update(req.user.id, { full_name, email });
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // 1) Get user from collection
    const user = await User.findById(req.user.id);
    
    // 2) Check if posted current password is correct
    if (!(await User.isPasswordMatch(user, currentPassword))) {
      return next(new ApiError(401, 'Your current password is incorrect'));
    }
    
    // 3) If so, update password
    await User.update(req.user.id, { password: newPassword });
    
    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  
  res.status(200).json({
    status: 'success',
    message: 'User logged out successfully',
  });
};
