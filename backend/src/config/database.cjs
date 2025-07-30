const { Sequelize } = require('sequelize');
const envConfig = require('./env.cjs');
const logger = require('../utils/logger.cjs');

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
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

// Development configuration
const development = {
  ...commonConfig,
  username: envConfig.db.user,
  password: envConfig.db.password,
  database: envConfig.db.name,
  host: envConfig.db.host,
  port: envConfig.db.port,
};

// Test configuration
const test = {
  ...commonConfig,
  username: envConfig.test.db.user,
  password: envConfig.test.db.password,
  database: envConfig.test.db.name,
  host: envConfig.test.db.host,
  port: envConfig.test.db.port,
};

// Production configuration
const production = {
  ...commonConfig,
  username: envConfig.db.user,
  password: envConfig.db.password,
  database: envConfig.db.name,
  host: envConfig.db.host,
  port: envConfig.db.port,
  dialectOptions: {
    ...commonConfig.dialectOptions,
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
};

module.exports = {
  development,
  test,
  production,
};
