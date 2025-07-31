import api from './api';

const userService = {
  // Get all users
  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch users',
        data: []
      };
    }
  },

  // Add a new user
  addUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add user',
        data: null
      };
    }
  },
};

export default userService;
