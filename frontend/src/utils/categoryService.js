import { supabase, handleSupabaseError } from '../lib/supabase';

const categoryService = {
  // Get all active categories
  getCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) {
        return { success: false, error: handleSupabaseError(error), data: [] };
      }
      
      return { success: true, data: data || [] };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to fetch categories'),
        data: [] 
      };
    }
  },

  // Get category by ID
  getCategoryById: async (categoryId) => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('id', categoryId)
        .single();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to fetch category') 
      };
    }
  },

  // Create category
  createCategory: async (categoryData) => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .insert([categoryData])
        .select()
        .single();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to create category') 
      };
    }
  },

  // Update category
  updateCategory: async (categoryId, updates) => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .update(updates)
        .eq('id', categoryId)
        .select()
        .single();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to update category') 
      };
    }
  },

  // Delete category (soft delete)
  deleteCategory: async (categoryId) => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .update({ active: false })
        .eq('id', categoryId)
        .select()
        .single();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to delete category') 
      };
    }
  }
};

export default categoryService;