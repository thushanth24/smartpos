const express = require('express');
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes after this middleware are protected
router.use(protect);

// Admin only routes
router.use(authorize('admin'));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
