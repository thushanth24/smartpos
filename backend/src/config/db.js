import { Sequelize } from 'sequelize';
import logger from '../utils/logger.js';
import envConfig from './env.js';

// Initialize Sequelize with the appropriate configuration
let sequelize;

if (envConfig.db.url) {
  // Use connection string if provided
  sequelize = new Sequelize(envConfig.db.url, {
    dialect: 'postgres',
    logging: envConfig.env === 'development' ? (msg) => logger.debug(msg) : false,
    dialectOptions: {
      ssl: envConfig.db.ssl ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: envConfig.db.pool.max,
      min: envConfig.db.pool.min,
      acquire: envConfig.db.pool.acquire,
      idle: envConfig.db.pool.idle,
      evict: envConfig.db.pool.evict,
    },
  });
} else {
  // Use individual connection parameters
  sequelize = new Sequelize(
    envConfig.db.name,
    envConfig.db.user,
    envConfig.db.password,
    {
      host: envConfig.db.host,
      port: envConfig.db.port,
      dialect: 'postgres',
      logging: envConfig.env === 'development' ? (msg) => logger.debug(msg) : false,
      dialectOptions: {
        ssl: envConfig.db.ssl ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      pool: {
        max: envConfig.db.pool.max,
        min: envConfig.db.pool.min,
        acquire: envConfig.db.pool.acquire,
        idle: envConfig.db.pool.idle,
        evict: envConfig.db.pool.evict,
      },
    }
  );
}

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    logger.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

// Sync all models with the database
const syncDatabase = async (options = {}) => {
  try {
    const { force = false, alter = false } = options;
    
    if (force) {
      logger.warn('⚠️  Force syncing database - this will drop all tables!');
    } else if (alter) {
      logger.warn('⚠️  Altering database - this may cause data loss!');
    }
    
    await sequelize.sync({ force, alter });
    logger.info('🔄 Database synchronized successfully');
    return true;
  } catch (error) {
    logger.error('❌ Error synchronizing database:', error);
    throw error;
  }
};

// Close the database connection
const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('🔌 Database connection closed');
    return true;
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
    throw error;
  }
};

// Export the Sequelize instance and all functions
export { 
  sequelize as default,
  testConnection,
  syncDatabase,
  closeConnection
};
