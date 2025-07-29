import { Sequelize } from 'sequelize';
import sequelize from '../config/database.js'; // ✅ already initialized
import User from '../models/User.js'; // ✅ fix missing import
import logger from './logger.js'; // ✅ fix missing import

// Initialize models
const db = {
  sequelize,
  Sequelize,
  User,
  // Add other models here
};


// Associate models if needed
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection is successful
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Successfully connected to the database');
    return true;
  } catch (error) {
    logger.error('Error connecting to the database:', error);
    return false;
  }
};

/**
 * Check database connection with more detailed information
 * @returns {Promise<Object>} Database status information
 */
const checkDatabaseConnection = async () => {
  const startTime = Date.now();
  
  try {
    // Test basic connection
    await sequelize.authenticate();
    
    // Get database version and stats
    const [versionResult] = await sequelize.query('SELECT version();');
    const [tableCountResult] = await sequelize.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public';"
    );
    
    const [dbSizeResult] = await sequelize.query(
      'SELECT pg_size_pretty(pg_database_size(current_database())) as size;'
    );
    
    const [activeConnections] = await sequelize.query(
      'SELECT count(*) as count FROM pg_stat_activity WHERE datname = current_database();'
    );
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'connected',
      dbVersion: versionResult[0]?.version || 'unknown',
      dbSize: dbSizeResult[0]?.size || 'unknown',
      tableCount: parseInt(tableCountResult[0]?.count || '0', 10),
      activeConnections: parseInt(activeConnections[0]?.count || '0', 10),
      responseTime: `${responseTime}ms`,
      message: 'Database connection is healthy',
      timestamp: new Date().toISOString(),
      database: {
        name: sequelize.config.database,
        dialect: sequelize.getDialect(),
        host: sequelize.config.host,
        port: sequelize.config.port,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      message: 'Unable to connect to the database',
      responseTime: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Close the database connection
 * @returns {Promise<void>}
 */
const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
};

/**
 * Execute a database transaction
 * @param {Function} callback - Async function that contains the transaction logic
 * @param {Object} [options] - Transaction options
 * @returns {Promise<*>} Result of the callback function
 */
const transaction = async (callback, options = {}) => {
  const t = await sequelize.transaction(options);
  
  try {
    const result = await callback(t);
    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error('Transaction failed, rolled back:', error);
    throw error;
  }
};

/**
 * Execute a raw SQL query
 * @param {string} query - SQL query string
 * @param {Array} [values] - Query parameters
 * @param {Object} [options] - Query options
 * @returns {Promise<Array>} Query results
 */
const query = async (query, values = [], options = {}) => {
  try {
    const [results] = await sequelize.query(query, {
      replacements: values,
      ...options,
    });
    return results;
  } catch (error) {
    logger.error('Database query failed:', { query, error });
    throw error;
  }
};

// Handle application termination
const handleShutdown = async (signal) => {
  logger.info(`${signal} received. Closing database connection...`);
  try {
    await closeConnection();
    logger.info('Database connection closed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during application shutdown:', error);
    process.exit(1);
  }
};

// Register shutdown handlers
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
  process.on(signal, () => handleShutdown(signal));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection at:', reason);
  // Consider whether to exit the process here
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  // Consider whether to exit the process here
});

export { 
  testConnection, 
  checkDatabaseConnection, 
  closeConnection,
  transaction,
  query,
};

export default db;
