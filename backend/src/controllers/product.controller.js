import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;
    const filters = {};
    
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (search) filters.search = search;
    
    const products = await Product.findAll(filters);
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.update(req.params.id, req.body);
    
    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    await Product.delete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product stock
// @route   PATCH /api/v1/products/:id/stock
// @access  Private
export const updateProductStock = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    
    if (typeof quantity !== 'number') {
      return next(new ApiError(400, 'Please provide a valid quantity'));
    }
    
    const product = await Product.updateStock(req.params.id, quantity);
    
    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products with low stock
// @route   GET /api/products/low-stock
// @access  Private/Admin
import { Op } from 'sequelize';
import sequelize from '../config/db.js';

export const getLowStockProducts = async (req, res, next) => {
  try {
    // Find products where stock_quantity <= min_stock_level
    // Use raw SQL query for compatibility
    const [lowStockProducts] = await sequelize.query(
      "SELECT * FROM products WHERE stock_quantity <= min_stock_level AND status = 'active' ORDER BY stock_quantity ASC"
    );
    res.json({ success: true, data: lowStockProducts });
  } catch (error) {
    console.error('Low stock error:', error);
    if (error.parent) console.error('SQL error:', error.parent);
    next(error);
  }
};