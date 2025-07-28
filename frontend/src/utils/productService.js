import { supabase, handleSupabaseError } from '../lib/supabase';

const productService = {
  // Get all products with categories
  getProducts: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(
            id,
            name,
            color,
            icon
          )
        `)
        .eq('status', 'active')
        .order('name');
      
      if (error) {
        return { success: false, error: handleSupabaseError(error), data: [] };
      }
      
      return { success: true, data: data || [] };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to fetch products'),
        data: [] 
      };
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(
            id,
            name,
            color,
            icon
          )
        `)
        .eq('category_id', categoryId)
        .eq('status', 'active')
        .order('name');
      
      if (error) {
        return { success: false, error: handleSupabaseError(error), data: [] };
      }
      
      return { success: true, data: data || [] };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to fetch products by category'),
        data: [] 
      };
    }
  },

  // Search products
  searchProducts: async (searchTerm) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(
            id,
            name,
            color,
            icon
          )
        `)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
        .eq('status', 'active')
        .order('name');
      
      if (error) {
        return { success: false, error: handleSupabaseError(error), data: [] };
      }
      
      return { success: true, data: data || [] };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to search products'),
        data: [] 
      };
    }
  },

  // Get product by ID
  getProductById: async (productId) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(
            id,
            name,
            color,
            icon
          )
        `)
        .eq('id', productId)
        .single();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to fetch product') 
      };
    }
  },

  // Get low stock products
  getLowStockProducts: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(
            id,
            name,
            color,
            icon
          )
        `)
        .lt('stock_quantity', supabase.raw('min_stock_level'))
        .eq('status', 'active')
        .order('stock_quantity');
      
      if (error) {
        return { success: false, error: handleSupabaseError(error), data: [] };
      }
      
      return { success: true, data: data || [] };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to fetch low stock products'),
        data: [] 
      };
    }
  },

  // Create product
  createProduct: async (productData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to create product') 
      };
    }
  },

  // Update product
  updateProduct: async (productId, updates) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to update product') 
      };
    }
  },

  // Update product stock
  updateProductStock: async (productId, movementType, quantity, referenceType = null, referenceId = null, notes = null) => {
    try {
      const { data, error } = await supabase
        .rpc('update_product_stock', {
          product_uuid: productId,
          movement_type_param: movementType,
          quantity_param: quantity,
          reference_type_param: referenceType,
          reference_id_param: referenceId,
          notes_param: notes
        });
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to update stock') 
      };
    }
  },

  // Delete product (soft delete)
  deleteProduct: async (productId) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to delete product') 
      };
    }
  }
};

export default productService;