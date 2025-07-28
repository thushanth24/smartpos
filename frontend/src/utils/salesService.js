import { supabase, handleSupabaseError } from '../lib/supabase';

const salesService = {
  // Create a new sale transaction
  createSaleTransaction: async (transactionData) => {
    try {
      const { data, error } = await supabase
        .from('sales_transactions')
        .insert([transactionData])
        .select(`
          *,
          cashier:user_profiles!sales_transactions_cashier_id_fkey(
            id,
            full_name,
            email
          ),
          customer:customers(
            id,
            name,
            email,
            phone
          )
        `)
        .single();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to create transaction') 
      };
    }
  },

  // Create sale items for a transaction
  createSaleItems: async (saleItems) => {
    try {
      const { data, error } = await supabase
        .from('sale_items')
        .insert(saleItems)
        .select();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to create sale items') 
      };
    }
  },

  // Process complete sale (transaction + items + stock updates)
  processSale: async (saleData) => {
    try {
      // Start transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('sales_transactions')
        .insert([{
          transaction_number: saleData.transaction_number,
          receipt_number: saleData.receipt_number,
          cashier_id: saleData.cashier_id,
          customer_id: saleData.customer_id || null,
          subtotal: saleData.subtotal,
          tax_amount: saleData.tax_amount,
          discount_amount: saleData.discount_amount,
          total_amount: saleData.total_amount,
          payment_method: saleData.payment_method,
          payment_reference: saleData.payment_reference || null,
          status: 'completed',
          notes: saleData.notes || null,
          synced: navigator.onLine
        }])
        .select()
        .single();
      
      if (transactionError) {
        return { success: false, error: handleSupabaseError(transactionError) };
      }

      // Create sale items
      const saleItems = saleData.items?.map(item => ({
        transaction_id: transaction.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_price: item.product_price,
        quantity: item.quantity,
        line_total: item.line_total
      })) || [];

      if (saleItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItems);
        
        if (itemsError) {
          // Rollback transaction if items creation fails
          await supabase
            .from('sales_transactions')
            .delete()
            .eq('id', transaction.id);
          
          return { success: false, error: handleSupabaseError(itemsError) };
        }

        // Update stock for each item
        for (const item of saleItems) {
          if (item.product_id) {
            await supabase.rpc('update_product_stock', {
              product_uuid: item.product_id,
              movement_type_param: 'out',
              quantity_param: item.quantity,
              reference_type_param: 'sale',
              reference_id_param: transaction.id,
              notes_param: `Sale: ${transaction.transaction_number}`
            });
          }
        }
      }
      
      return { success: true, data: transaction };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to process sale') 
      };
    }
  },

  // Get sales transactions with filters
  getSalesTransactions: async (filters = {}) => {
    try {
      let query = supabase
        .from('sales_transactions')
        .select(`
          *,
          cashier:user_profiles!sales_transactions_cashier_id_fkey(
            id,
            full_name,
            email
          ),
          customer:customers(
            id,
            name,
            email,
            phone
          ),
          sale_items(
            id,
            product_name,
            product_price,
            quantity,
            line_total
          )
        `);

      // Apply filters
      if (filters.cashier_id) {
        query = query.eq('cashier_id', filters.cashier_id);
      }
      
      if (filters.customer_id) {
        query = query.eq('customer_id', filters.customer_id);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.payment_method) {
        query = query.eq('payment_method', filters.payment_method);
      }
      
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(filters.limit || 50);
      
      if (error) {
        return { success: false, error: handleSupabaseError(error), data: [] };
      }
      
      return { success: true, data: data || [] };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to fetch transactions'),
        data: [] 
      };
    }
  },

  // Get recent transactions (for dashboard)
  getRecentTransactions: async (limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('sales_transactions')
        .select(`
          *,
          cashier:user_profiles!sales_transactions_cashier_id_fkey(
            id,
            full_name,
            email
          ),
          customer:customers(
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        return { success: false, error: handleSupabaseError(error), data: [] };
      }
      
      return { success: true, data: data || [] };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to fetch recent transactions'),
        data: [] 
      };
    }
  },

  // Get sales analytics
  getSalesAnalytics: async (period = 'today') => {
    try {
      let dateFilter = '';
      const now = new Date();
      
      switch (period) {
        case 'today':
          dateFilter = now.toISOString().split('T')[0];
          break;
        case 'yesterday':
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          dateFilter = yesterday.toISOString().split('T')[0];
          break;
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          dateFilter = weekAgo.toISOString();
          break;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(now.getMonth() - 1);
          dateFilter = monthAgo.toISOString();
          break;
        default:
          dateFilter = now.toISOString().split('T')[0];
      }

      const { data, error } = await supabase
        .from('sales_transactions')
        .select('total_amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', dateFilter);
      
      if (error) {
        return { success: false, error: handleSupabaseError(error), data: null };
      }
      
      const totalSales = data?.reduce((sum, transaction) => sum + parseFloat(transaction.total_amount), 0) || 0;
      const transactionCount = data?.length || 0;
      const averageTransaction = transactionCount > 0 ? totalSales / transactionCount : 0;
      
      return { 
        success: true, 
        data: {
          totalSales,
          transactionCount,
          averageTransaction,
          period
        }
      };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to fetch sales analytics'),
        data: null 
      };
    }
  },

  // Get top selling products
  getTopSellingProducts: async (limit = 5, period = 'week') => {
    try {
      let dateFilter = '';
      const now = new Date();
      
      switch (period) {
        case 'today':
          dateFilter = now.toISOString().split('T')[0];
          break;
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          dateFilter = weekAgo.toISOString();
          break;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(now.getMonth() - 1);
          dateFilter = monthAgo.toISOString();
          break;
        default:
          dateFilter = now.toISOString().split('T')[0];
      }

      const { data, error } = await supabase
        .from('sale_items')
        .select(`
          product_id,
          product_name,
          product_price,
          quantity,
          line_total,
          transaction:sales_transactions!inner(
            created_at,
            status
          )
        `)
        .eq('transaction.status', 'completed')
        .gte('transaction.created_at', dateFilter);
      
      if (error) {
        return { success: false, error: handleSupabaseError(error), data: [] };
      }
      
      // Group by product and calculate totals
      const productSales = {};
      data?.forEach(item => {
        const key = item.product_id || item.product_name;
        if (!productSales[key]) {
          productSales[key] = {
            id: item.product_id,
            name: item.product_name,
            price: item.product_price,
            soldQuantity: 0,
            revenue: 0
          };
        }
        productSales[key].soldQuantity += item.quantity;
        productSales[key].revenue += parseFloat(item.line_total);
      });
      
      // Convert to array and sort by revenue
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
      
      return { success: true, data: topProducts };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to fetch top selling products'),
        data: [] 
      };
    }
  },

  // Generate unique transaction number
  generateTransactionNumber: () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = now.getTime().toString().slice(-6);
    return `TXN-${dateStr}-${timeStr}`;
  },

  // Generate unique receipt number
  generateReceiptNumber: () => {
    const now = new Date();
    const year = now.getFullYear();
    const sequence = now.getTime().toString().slice(-6);
    return `R-${year}-${sequence}`;
  }
};

export default salesService;