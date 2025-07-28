const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);

// Test database connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    
    if (error) throw error;
    
    logger.info('Successfully connected to Supabase');
    return true;
  } catch (error) {
    logger.error('Error connecting to Supabase:', error.message);
    throw error;
  }
};

module.exports = {
  supabase,
  testConnection,
};
