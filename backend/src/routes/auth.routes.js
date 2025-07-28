import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  updateMe, 
  updatePassword, 
  logout 
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.use(authenticate);

router.get('/me', getMe);
router.put('/me', updateMe);
router.put('/update-password', updatePassword);
router.post('/logout', logout);

export default router;
