import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error, defaultMessage = 'An error occurred') => {
  if (error?.message?.includes('Failed to fetch') || 
      error?.message?.includes('AuthRetryableFetchError') ||
      error?.message?.includes('NetworkError')) {
    return 'Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.';
  }
  
  return error?.message || defaultMessage;
};

// Database health check
export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      return { connected: false, error: handleSupabaseError(error) };
    }
    
    return { connected: true, error: null };
  } catch (error) {
    return { 
      connected: false, 
      error: handleSupabaseError(error, 'Database connection failed') 
    };
  }
};