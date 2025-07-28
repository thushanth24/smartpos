const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication)
router.use(protect);

router.get('/me', authController.getMe);
router.put('/updatedetails', authController.updateDetails);
router.put('/updatepassword', authController.updatePassword);
router.get('/logout', authController.logout);

module.exports = router;
