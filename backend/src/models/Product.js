const { supabase } = require('../config/db');
const ApiError = require('../utils/ApiError');

class Product {
  // Create a new product
  static async create(productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();

      if (error) throw error;
      
      return data[0];
    } catch (error) {
      throw new ApiError(400, `Error creating product: ${error.message}`);
    }
  }

  // Get all products with optional filters
  static async findAll(filters = {}) {
    try {
      let query = supabase.from('products').select('*');
      
      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      
      // Execute query
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      throw new ApiError(500, `Error fetching products: ${error.message}`);
    }
  }

  // Get product by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          throw new ApiError(404, 'Product not found');
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error fetching product: ${error.message}`);
    }
  }

  // Update product
  static async update(id, updateData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new ApiError(404, 'Product not found');
      }
      
      return data[0];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error updating product: ${error.message}`);
    }
  }

  // Delete product
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      throw new ApiError(500, `Error deleting product: ${error.message}`);
    }
  }

  // Update product stock
  static async updateStock(id, quantityChange) {
    try {
      // First get current stock
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      if (!product) throw new ApiError(404, 'Product not found');
      
      // Calculate new stock
      const newStock = (product.stock || 0) + quantityChange;
      
      if (newStock < 0) {
        throw new ApiError(400, 'Insufficient stock');
      }
      
      // Update stock
      const { data, error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', id)
        .select();
      
      if (updateError) throw updateError;
      
      return data[0];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error updating product stock: ${error.message}`);
    }
  }
}

module.exports = Product;
