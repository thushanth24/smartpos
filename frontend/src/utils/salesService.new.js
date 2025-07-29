import http from './api';

const salesService = {
  // Create a new sale transaction
  createSaleTransaction: async (transactionData) => {
    try {
      const response = await http.post('/sales/transactions', transactionData);
      return { 
        success: true, 
        data: response 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to create sale transaction' 
      };
    }
  },

  // Create sale items for a transaction
  createSaleItems: async (saleItems) => {
    try {
      const response = await http.post('/sales/items', saleItems);
      return { 
        success: true, 
        data: response 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to create sale items' 
      };
    }
  },

  // Process complete sale (transaction + items + stock updates)
  processSale: async (saleData) => {
    try {
      const response = await http.post('/sales/process', saleData);
      return { 
        success: true, 
        data: response 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to process sale' 
      };
    }
  },

  // Get sales transactions with filters
  getSalesTransactions: async (filters = {}) => {
    try {
      const response = await http.get('/sales/transactions', { params: filters });
      return { 
        success: true, 
        data: response 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch transactions',
        data: []
      };
    }
  },

  // Get recent transactions (for dashboard)
  getRecentTransactions: async (limit = 10) => {
    try {
      const response = await http.get('/sales/transactions/recent', { 
        params: { limit } 
      });
      return { 
        success: true, 
        data: response 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch recent transactions',
        data: []
      };
    }
  },

  // Get sales analytics
  getSalesAnalytics: async (period = 'today') => {
    try {
      const response = await http.get('/sales/analytics', { 
        params: { period } 
      });
      return { 
        success: true, 
        data: response 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch sales analytics',
        data: null
      };
    }
  },

  // Get top selling products
  getTopSellingProducts: async (limit = 5, period = 'week') => {
    try {
      const response = await http.get('/sales/top-products', { 
        params: { limit, period } 
      });
      return { 
        success: true, 
        data: response 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch top selling products',
        data: []
      };
    }
  },

  // Generate unique transaction number
  generateTransactionNumber: async () => {
    // This should be handled by the backend
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `TXN-${timestamp}-${random}`;
  },

  // Generate unique receipt number
  generateReceiptNumber: async () => {
    // This should be handled by the backend
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `RCPT-${timestamp}-${random}`;
  }
};

export default salesService;
