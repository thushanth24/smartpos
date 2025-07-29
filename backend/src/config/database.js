import { Sequelize } from 'sequelize';
import envConfig from './env.js';
import logger from '../utils/logger.js';

// Common configuration for all environments
const commonConfig = {
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    defaultScope: {
      attributes: {
        exclude: ['deleted_at'],
      },
    },
    scopes: {
      withDeleted: {
        paranoid: false,
      },
    },
  },
  dialect: 'postgres',
  logging: envConfig.env === 'development' ? (msg) => logger.debug(msg) : false,
  dialectOptions: {
    ssl: envConfig.db.ssl ? {
      require: true,
      rejectUnauthorized: false,
    } : false,
  },
  pool: {
    max: envConfig.db.pool.max,
    min: envConfig.db.pool.min,
    acquire: envConfig.db.pool.acquire,
    idle: envConfig.db.pool.idle,
    evict: envConfig.db.pool.evict,
  },
};

// Environment-specific configurations
const environmentConfigs = {
  development: {
    database: envConfig.db.name || 'smartpos_dev',
    username: envConfig.db.user || 'postgres',
    password: envConfig.db.password || 'postgres',
    host: envConfig.db.host || 'localhost',
    port: envConfig.db.port || 5432,
  },
  test: {
    database: envConfig.db.name || 'smartpos_test',
    username: envConfig.db.user || 'postgres',
    password: envConfig.db.password || 'postgres',
    host: envConfig.db.host || 'localhost',
    port: envConfig.db.port || 5432,
    logging: false,
  },
  production: {
    database: envConfig.db.name,
    username: envConfig.db.user,
    password: envConfig.db.password,
    host: envConfig.db.host,
    port: envConfig.db.port,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};

// Combine common and environment-specific configurations
const config = Object.entries(environmentConfigs).reduce((acc, [env, envConfig]) => {
  acc[env] = {
    ...commonConfig,
    ...envConfig,
  };
  return acc;
}, {});

// Get the current environment configuration
const currentEnv = envConfig.env;
const currentConfig = config[currentEnv];

if (!currentConfig) {
  throw new Error(`Invalid NODE_ENV: ${currentEnv}. Must be one of: ${Object.keys(config).join(', ')}`);
}

// Initialize Sequelize with the appropriate configuration
let sequelize;

if (envConfig.db.url) {
  // Use connection string if provided
  sequelize = new Sequelize(envConfig.db.url, {
    ...commonConfig,
    dialectOptions: {
      ...commonConfig.dialectOptions,
      ssl: envConfig.db.ssl ? {
        require: true,
        rejectUnauthorized: false,
      } : false,
    },
  });
} else {
  // Use individual connection parameters
  sequelize = new Sequelize(
    currentConfig.database,
    currentConfig.username,
    currentConfig.password,
    {
      ...currentConfig,
      ...commonConfig,
    }
  );
}

export default sequelize;
