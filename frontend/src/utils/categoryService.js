import api from './api';

const categoryService = {
  // Get all active categories
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch categories',
        data: [] 
      };
    }
  },

  // Get category by ID
  getCategoryById: async (categoryId) => {
    try {
      const response = await api.get(`/categories/${categoryId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch category' 
      };
    }
  },

  // Create category
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create category' 
      };
    }
  },

  // Update category
  updateCategory: async (categoryId, updates) => {
    try {
      const response = await api.patch(`/categories/${categoryId}`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update category' 
      };
    }
  },

  // Delete category (soft delete)
  deleteCategory: async (categoryId) => {
    try {
      const response = await api.delete(`/categories/${categoryId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete category' 
      };
    }
  }
};

export default categoryService;