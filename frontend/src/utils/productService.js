import api from './api';

const productService = {
  // Get all products with categories
  getProducts: async () => {
    try {
      const response = await api.get('/products');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch products',
        data: [] 
      };
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId) => {
    try {
      const response = await api.get(`/products/category/${categoryId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch products by category',
        data: [] 
      };
    }
  },

  // Search products
  searchProducts: async (searchTerm) => {
    try {
      const response = await api.get(`/products/search?q=${encodeURIComponent(searchTerm)}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to search products',
        data: [] 
      };
    }
  },

  // Get product by ID
  getProductById: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch product details' 
      };
    }
  },

  // Get low stock products
  getLowStockProducts: async () => {
    try {
      const response = await api.get('/products/low-stock');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch low stock products',
        data: [] 
      };
    }
  },

  // Create product
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create product' 
      };
    }
  },

  // Update product
  updateProduct: async (productId, updates) => {
    try {
      const response = await api.patch(`/products/${productId}`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update product' 
      };
    }
  },

  // Update product stock
  updateProductStock: async (productId, movementType, quantity, referenceType = null, referenceId = null, notes = null) => {
    try {
      const response = await api.post(`/products/${productId}/stock`, {
        movementType,
        quantity,
        referenceType,
        referenceId,
        notes
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update product stock' 
      };
    }
  },

  // Delete product (soft delete)
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/products/${productId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete product' 
      };
    }
  }
};

export default productService;