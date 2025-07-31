import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    // Fetch all users from the database, exclude sensitive fields
    const users = await User.findAll({
      attributes: { exclude: ['password', 'refresh_token'] }
    });
    // Ensure permissions is always an array
    const usersWithPermissions = users.map(user => {
      const plainUser = user.get ? user.get({ plain: true }) : user;
      return {
        ...plainUser,
        permissions: Array.isArray(plainUser.permissions) ? plainUser.permissions : []
      };
    });
    res.status(200).json({
      status: 'success',
      results: usersWithPermissions.length,
      data: {
        users: usersWithPermissions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
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

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
export const createUser = async (req, res, next) => {
  try {
    // Accept all relevant fields from frontend
    const {
      email,
      password,
      name,
      phone,
      role = 'cashier',
      status = 'active',
      permissions = [],
      lastLogin,
      createdAt
    } = req.body;

    // Map frontend 'name' to backend 'full_name'
    const userData = {
      email,
      password,
      full_name: name,
      phone,
      role,
      status,
      permissions,
      last_login: lastLogin,
      created_at: createdAt
    };

    // Remove undefined/null fields
    Object.keys(userData).forEach(key => {
      if (userData[key] === undefined || userData[key] === null || userData[key] === '') {
        delete userData[key];
      }
    });

    // Create user in DB
    const user = await User.create(userData);

    res.status(201).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const { email, full_name, role, status } = req.body;
    
    const user = await User.update(req.params.id, {
      email,
      full_name,
      role,
      status
    });
    
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

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    // Don't allow deleting your own account
    if (req.user.id === req.params.id) {
      return next(new ApiError(400, 'You cannot delete your own account'));
    }
    
    await User.delete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    res.status(201).json({ message: 'Register endpoint (not implemented)' });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    res.status(200).json({ message: 'Login endpoint (not implemented)' });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    res.status(200).json({ message: 'Forgot Password endpoint (not implemented)' });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    res.status(200).json({ message: 'Reset Password endpoint (not implemented)' });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ message: 'Get Me endpoint (not implemented)' });
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    res.status(200).json({ message: 'Update Me endpoint (not implemented)' });
  } catch (err) {
    next(err);
  }
};

export const deleteMe = async (req, res, next) => {
  try {
    res.status(204).json({ message: 'Delete Me endpoint (not implemented)' });
  } catch (err) {
    next(err);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    res.status(200).json({ message: 'Update Password endpoint (not implemented)' });
  } catch (err) {
    next(err);
  }
};

