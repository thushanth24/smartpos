const express = require('express');
const productController = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth');

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

module.exports = router;
