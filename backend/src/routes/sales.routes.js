import express from 'express';
import * as salesController from '../controllers/sales.controller.js';
import auth from '../middleware/auth.js';
const { authenticate: protect, authorize } = auth;

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/sales/analytics
router.get('/analytics', salesController.getSalesAnalytics);

// GET /api/sales/transactions/recent
router.get('/transactions/recent', salesController.getRecentTransactions);

// GET /api/sales/top-products
router.get('/top-products', salesController.getTopProducts);

export default router;
