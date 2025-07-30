import { generateToken } from '../utils/jwt.js';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';

// Create and send token
const createSendToken = (user, statusCode, res) => {
  console.log('[createSendToken] Generating token for user:', user.email);
  
  // Generate JWT token
  const token = generateToken({ 
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name
  });
  
  console.log('[createSendToken] Token generated successfully');
  
  // Remove password from output
  const userObj = user.get ? user.get({ plain: true }) : { ...user };
  if (userObj.password) {
    delete userObj.password;
  }

  // Prepare response data - ensure this matches what the frontend expects
  const responseData = {
    success: true,
    status: 'success',
    token,  // Include token at the root level
    user: userObj  // Include user data directly in the response
  };

  console.log('[createSendToken] Sending response:', {
    statusCode,
    data: responseData,
    headers: res.getHeaders()
  });
  
  // Set headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  
  // Send response
  return res.status(statusCode).json(responseData);
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, full_name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new ApiError(400, 'Email already in use'));
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      full_name,
      role: role || 'staff',
      status: 'active'
    });

    createSendToken(user, 201, res);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  console.log('=== Login Request Received ===');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // 1) Check if email and password exist
    if (!email || !password) {
      console.error('Missing credentials - Email:', !!email, 'Password:', !!password);
      return next(new ApiError(400, 'Please provide email and password'));
    }

    // 2) Check if user exists
    console.log('Searching for user in database...');
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.error('User not found with email:', email);
      return next(new ApiError(401, 'Incorrect email or password'));
    }
    console.log('User found:', { id: user.id, email: user.email, status: user.status });

    // 3) Check if password is correct
    console.log('Validating password...');
    const isMatch = await user.validPassword(password);
    if (!isMatch) {
      console.error('Invalid password for user:', email);
      return next(new ApiError(401, 'Incorrect email or password'));
    }
    console.log('Password validated successfully');

    // 4) Check if user is active
    if (user.status !== 'active') {
      console.error('Login attempt for inactive account:', email);
      return next(new ApiError(403, 'Your account is not active. Please contact an administrator.'));
    }

    // 5) If everything ok, send token to client
    console.log('Login successful, generating token...');
    createSendToken(user, 200, res);
    console.log('Token generated and sent to client');
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      ...(error.response && { response: error.response.data })
    });
    next(new ApiError(500, error.message));
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

/**
 * @desc    Update user details
 * @route   PUT /api/v1/auth/me
 * @access  Private
 */
export const updateMe = async (req, res, next) => {
  try {
    const { full_name, email } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    // Update user details
    user.full_name = full_name || user.full_name;
    user.email = email || user.email;
    
    await user.save();

    // Get user without password
    const userData = user.get({ plain: true });
    delete userData.password;

    res.status(200).json({
      success: true,
      data: { user: userData }
    });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/v1/auth/update-password
 * @access  Private
 */
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    // Check current password
    const isMatch = await user.validPassword(currentPassword);
    if (!isMatch) {
      return next(new ApiError(401, 'Current password is incorrect'));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = (req, res) => {
  // Client-side should remove the token
  res.status(200).json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
};
