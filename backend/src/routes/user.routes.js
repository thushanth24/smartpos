import express from 'express';
import * as userController from '../controllers/user.controller.js';
import auth from '../middleware/auth.js';
const { authenticate: protect, authorize } = auth;

const router = express.Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);

// Protected routes (require authentication)
router.use(protect);

// Routes for the currently authenticated user
router.get('/me', userController.getMe);
router.put('/update-me', userController.updateMe);
router.delete('/delete-me', userController.deleteMe);
router.put('/update-password', userController.updatePassword);

// Admin routes
router.use(authorize('admin'));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
