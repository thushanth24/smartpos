import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

// Database configuration for different environments
const config = {
  development: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/smartpos_dev',
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    url: process.env.TEST_DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/smartpos_test',
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 20,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
  },
};

// Validate required environment variables
if (!config[env]) {
  throw new Error(`Invalid NODE_ENV: ${env}. Must be one of: ${Object.keys(config).join(', ')}`);
}

if (env === 'production' && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required in production environment');
}

// Initialize Sequelize with the appropriate configuration
const sequelize = new Sequelize(config[env].url, {
  ...config[env],
  logging: config[env].logging,
  define: config[env].define,
  pool: config[env].pool,
});

export default sequelize;
