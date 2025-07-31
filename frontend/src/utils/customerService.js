import http from './api';

const customerService = {
  // Get all customers
  getCustomers: async () => {
    try {
      const response = await http.get('/customers');
      return { 
        success: true, 
        data: response.data // Return only the data array/object
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch customers',
        data: []
      };
    }
  },

  // Search customers by name, email, or phone
  searchCustomers: async (searchTerm) => {
    if (!searchTerm) return { success: true, data: [] };
    
    try {
      const response = await http.get('/customers/search', { 
        params: { q: searchTerm } 
      });
      
      return { 
        success: true, 
        data: response.data // Return only the data array/object
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to search customers',
        data: [] 
      };
    }
  },

  // Get customer by ID
  getCustomerById: async (customerId) => {
    try {
      const response = await http.get(`/customers/${customerId}`);
      return { 
        success: true, 
        data: response.data // Return only the data object
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch customer',
        data: null
      };
    }
  },

  // Create a new customer
  createCustomer: async (customerData) => {
    try {
      const response = await http.post('/customers', customerData);
      return { 
        success: true, 
        data: response,
        message: 'Customer created successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to create customer',
        data: null
      };
    }
  },

  // Update a customer
  updateCustomer: async (customerId, updates) => {
    try {
      const response = await http.put(`/customers/${customerId}`, updates);
      return { 
        success: true, 
        data: response,
        message: 'Customer updated successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to update customer',
        data: null
      };
    }
  },

  // Delete a customer
  deleteCustomer: async (customerId) => {
    try {
      await http.delete(`/customers/${customerId}`);
      return { 
        success: true, 
        message: 'Customer deleted successfully' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to delete customer' 
      };
    }
  },

  // Get customer statistics
  getCustomerStats: async (customerId) => {
    try {
      const response = await http.get(`/customers/${customerId}/stats`);
      return { 
        success: true, 
        data: response.data // Return only the data object
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch customer statistics',
        data: null
      };
    }
  },

  // Get customer transactions
  getCustomerTransactions: async (customerId, filters = {}) => {
    try {
      const response = await http.get(`/customers/${customerId}/transactions`, { 
        params: filters 
      });
      
      return { 
        success: true, 
        data: response.data // Return only the data array/object
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch customer transactions',
        data: [] 
      };
    }
  },

  // Update customer loyalty points and total spent
  updateCustomerStats: async (customerId, pointsToAdd, amountToAdd) => {
    try {
      const { data: customer, error: fetchError } = await http.get(`/customers/${customerId}`);
      
      if (fetchError) {
        return { success: false, error: fetchError.message || 'Failed to fetch customer' };
      }
      
      const newPoints = (customer.loyalty_points || 0) + pointsToAdd;
      const newTotalSpent = (customer.total_spent || 0) + amountToAdd;
      
      const response = await http.put(`/customers/${customerId}`, {
        loyalty_points: newPoints,
        total_spent: newTotalSpent,
      });
      
      return { 
        success: true, 
        data: response 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to update customer stats',
        data: null
      };
    }
  }
};

export default customerService;