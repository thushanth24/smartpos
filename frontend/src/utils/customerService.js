import { supabase, handleSupabaseError } from '../lib/supabase';

const customerService = {
  // Get all customers
  getCustomers: async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (error) {
        return { success: false, error: handleSupabaseError(error), data: [] };
      }
      
      return { success: true, data: data || [] };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to fetch customers'),
        data: [] 
      };
    }
  },

  // Search customers
  searchCustomers: async (searchTerm) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order('name')
        .limit(20);
      
      if (error) {
        return { success: false, error: handleSupabaseError(error), data: [] };
      }
      
      return { success: true, data: data || [] };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to search customers'),
        data: [] 
      };
    }
  },

  // Get customer by ID
  getCustomerById: async (customerId) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to fetch customer') 
      };
    }
  },

  // Create customer
  createCustomer: async (customerData) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to create customer') 
      };
    }
  },

  // Update customer
  updateCustomer: async (customerId, updates) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
        .select()
        .single();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to update customer') 
      };
    }
  },

  // Update customer loyalty points and total spent
  updateCustomerStats: async (customerId, pointsToAdd, amountToAdd) => {
    try {
      const { data: customer, error: fetchError } = await supabase
        .from('customers')
        .select('loyalty_points, total_spent')
        .eq('id', customerId)
        .single();
      
      if (fetchError) {
        return { success: false, error: handleSupabaseError(fetchError) };
      }
      
      const newPoints = (customer.loyalty_points || 0) + pointsToAdd;
      const newTotalSpent = (customer.total_spent || 0) + amountToAdd;
      
      const { data, error } = await supabase
        .from('customers')
        .update({
          loyalty_points: newPoints,
          total_spent: newTotalSpent,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
        .select()
        .single();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to update customer stats') 
      };
    }
  },

  // Get customer transaction history
  getCustomerTransactions: async (customerId, limit = 20) => {
    try {
      const { data, error } = await supabase
        .from('sales_transactions')
        .select(`
          *,
          cashier:user_profiles!sales_transactions_cashier_id_fkey(
            id,
            full_name
          ),
          sale_items(
            id,
            product_name,
            product_price,
            quantity,
            line_total
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        return { success: false, error: handleSupabaseError(error), data: [] };
      }
      
      return { success: true, data: data || [] };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to fetch customer transactions'),
        data: [] 
      };
    }
  },

  // Delete customer
  deleteCustomer: async (customerId) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to delete customer') 
      };
    }
  }
};

export default customerService;