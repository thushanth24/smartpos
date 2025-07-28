const User = require('../models/User');
const ApiError = require('../utils/ApiError');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    // In a real app, you would fetch users from the database
    // This is a simplified example
    const users = [];
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
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
exports.createUser = async (req, res, next) => {
  try {
    const { email, password, full_name, role } = req.body;
    
    // Create user
    const user = await User.create({
      email,
      password,
      full_name,
      role: role || 'cashier'
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
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
exports.deleteUser = async (req, res, next) => {
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
