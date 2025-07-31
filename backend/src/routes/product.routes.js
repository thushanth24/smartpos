import express from 'express';
import * as productController from '../controllers/product.controller.js';
import auth from '../middleware/auth.js';
const { authenticate: protect, authorize } = auth;

const router = express.Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Protected routes (require authentication)
router.use(protect);

// Routes that require admin privileges
router.use(authorize('admin'));

router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Stock management routes
router.patch('/:id/stock', productController.updateProductStock);

// Low stock products route
router.get('/low-stock', productController.getLowStockProducts);

export default router;
