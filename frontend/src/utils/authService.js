import { supabase, handleSupabaseError } from '../lib/supabase';

const authService = {
  // Get current session
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to get session') 
      };
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to sign in') 
      };
    }
  },

  // Sign up with email and password
  signUp: async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name || userData.name || '',
            role: userData.role || 'cashier'
          }
        }
      });
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to sign up') 
      };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to sign out') 
      };
    }
  },

  // Get user profile from user_profiles table
  getUserProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to get user profile') 
      };
    }
  },

  // Update user profile
  updateUserProfile: async (userId, updates) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to update profile') 
      };
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        return { success: false, error: handleSupabaseError(error) };
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: handleSupabaseError(error, 'Failed to send reset email') 
      };
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

export default authService;