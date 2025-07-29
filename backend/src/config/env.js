import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Joi from 'joi';
import logger from '../utils/logger.js';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

// Define environment variables schema
const envVarsSchema = Joi.object()
  .keys({
    // Server Configuration
    NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
    PORT: Joi.number().default(5000),
    HOST: Joi.string().default('0.0.0.0'),

    // Database Configuration
    DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] })
      .when('DB_HOST', {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
      })
      .description('PostgreSQL connection string'),
    
    // Individual DB connection parameters (alternative to DATABASE_URL)
    DB_HOST: Joi.string().description('Database host'),
    DB_PORT: Joi.number().default(5432).description('Database port'),
    DB_NAME: Joi.string().description('Database name'),
    DB_USER: Joi.string().description('Database user'),
    DB_PASSWORD: Joi.string().description('Database password'),
    DB_SSL: Joi.boolean().default(false).description('Enable SSL for database connection'),
    
    // Connection Pool Settings
    DB_POOL_MAX: Joi.number().default(10).description('Maximum number of connections in pool'),
    DB_POOL_MIN: Joi.number().default(2).description('Minimum number of connections in pool'),
    DB_POOL_ACQUIRE: Joi.number().default(30000).description('Maximum time (ms) that a connection can be idle before being released'),
    DB_POOL_IDLE: Joi.number().default(10000).description('Maximum time (ms) that a connection can be idle before being closed'),
    DB_POOL_EVICT: Joi.number().default(1000).description('The time interval (ms) to check for idle connections to be evicted'),

    // JWT & Authentication
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_EXPIRES_IN: Joi.string().default('30d').description('JWT expiration time'),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('90d').description('JWT refresh token expiration time'),
    JWT_COOKIE_EXPIRES: Joi.number().default(30).description('JWT cookie expiration in days'),

    // CORS Configuration
    CORS_ORIGIN: Joi.string().default('*').description('Allowed CORS origins (comma-separated)'),
    CORS_METHODS: Joi.string().default('GET,POST,PUT,DELETE,PATCH,OPTIONS').description('Allowed HTTP methods for CORS'),
    CORS_ALLOWED_HEADERS: Joi.string().default('Content-Type,Authorization,X-Requested-With').description('Allowed headers for CORS'),
    CORS_CREDENTIALS: Joi.boolean().default(true).description('Enable CORS credentials'),
    CORS_MAX_AGE: Joi.number().default(86400).description('CORS max age in seconds'),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: Joi.alternatives().try(
      Joi.number(),
      Joi.string().pattern(/^\d+[smh]$/)
    ).default('15m').description('Rate limit window in milliseconds or with time unit (e.g., 15m, 1h)'),
    RATE_LIMIT_MAX: Joi.number().default(100).description('Maximum number of requests per window'),

    // Security Headers
    HELMET_ENABLED: Joi.boolean().default(true).description('Enable Helmet security headers'),
    CSP_ENABLED: Joi.boolean().default(true).description('Enable Content Security Policy'),
    HSTS_ENABLED: Joi.boolean().default(true).description('Enable HTTP Strict Transport Security'),

    // Logging
    LOG_LEVEL: Joi.string()
      .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
      .default('info')
      .description('Logging level'),
    LOG_TO_FILE: Joi.boolean().default(true).description('Enable logging to file'),
    LOG_DIR: Joi.string().default('logs').description('Directory to store log files'),
    LOG_MAX_SIZE: Joi.string().default('20m').description('Maximum size of log file before rotation'),
    LOG_MAX_FILES: Joi.string().default('14d').description('Maximum number of days to keep log files'),

    // Session & Cookies
    COOKIE_SECRET: Joi.string().required().description('Cookie secret key'),
    SESSION_SECRET: Joi.string().required().description('Session secret key'),
    SECURE_COOKIES: Joi.boolean().default(false).description('Enable secure cookies (requires HTTPS)'),

    // API
    API_PREFIX: Joi.string().default('/api/v1').description('API route prefix'),
    API_DOCS_PATH: Joi.string().default('/api-docs').description('API documentation path'),
    API_RESPONSE_TIMEOUT: Joi.number().default(30000).description('API response timeout in milliseconds'),
  })
  .unknown()
  .concat(
    Joi.object({
      // Production overrides - optional in all environments
      PROD_DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).optional().allow(''),
      PROD_DB_HOST: Joi.string().optional().allow(''),
      PROD_DB_PORT: Joi.alternatives()
        .try(
          Joi.number(),
          Joi.string().pattern(/^\d+$/).empty('')
        )
        .optional()
        .custom((value) => value ? Number(value) : undefined, 'Convert string to number'),
      PROD_DB_NAME: Joi.string().optional().allow(''),
      PROD_DB_USER: Joi.string().optional().allow(''),
      PROD_DB_PASSWORD: Joi.string().optional().allow(''),
      PROD_JWT_SECRET: Joi.string().optional().allow(''),
      PROD_COOKIE_SECRET: Joi.string().optional().allow(''),
      PROD_SESSION_SECRET: Joi.string().optional().allow(''),
      PROD_SECURE_COOKIES: Joi.boolean().optional(),
      
      // Development overrides
      DEV_DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).optional(),
      DEV_DB_HOST: Joi.string(),
      DEV_DB_PORT: Joi.number(),
      DEV_DB_NAME: Joi.string(),
      DEV_DB_USER: Joi.string(),
      DEV_DB_PASSWORD: Joi.string(),

      // Test overrides
      TEST_DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }),
      TEST_DB_HOST: Joi.string(),
      TEST_DB_PORT: Joi.number(),
      TEST_DB_NAME: Joi.string(),
      TEST_DB_USER: Joi.string(),
      TEST_DB_PASSWORD: Joi.string(),
    })
  );

// Apply environment-specific overrides
const applyEnvironmentOverrides = (envVars) => {
  const env = envVars.NODE_ENV || 'development';
  const prefix = env.toUpperCase();
  
  // Create a new object with overridden values
  const overriddenVars = { ...envVars };
  
  // Apply environment-specific overrides
  Object.keys(envVars).forEach((key) => {
    if (key.startsWith(`${prefix}_`)) {
      const newKey = key.replace(`${prefix}_`, '');
      overriddenVars[newKey] = envVars[key];
    }
  });
  
  return overriddenVars;
};

// Validate environment variables
const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env, { allowUnknown: true, stripUnknown: true });

if (error) {
  logger.error(`Config validation error: ${error.message}`);
  process.exit(1);
}

// Apply environment-specific overrides
const envConfig = applyEnvironmentOverrides(envVars);

// Parse CORS origins
const parseCorsOrigins = (origins) => {
  if (!origins) return [];
  return origins.split(',').map(origin => origin.trim());
};

// Parse CORS methods
const parseCorsMethods = (methods) => {
  if (!methods) return [];
  return methods.split(',').map(method => method.trim().toUpperCase());
};

// Parse CORS allowed headers
const parseCorsAllowedHeaders = (headers) => {
  if (!headers) return [];
  return headers.split(',').map(header => header.trim());
};

// Parse rate limit window
const parseRateLimitWindow = (window) => {
  if (typeof window === 'number') return window;
  
  const match = window.match(/^(\d+)([smh])$/);
  if (!match) return 15 * 60 * 1000; // Default to 15 minutes
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value * 1000; // seconds to milliseconds
    case 'm': return value * 60 * 1000; // minutes to milliseconds
    case 'h': return value * 60 * 60 * 1000; // hours to milliseconds
    default: return 15 * 60 * 1000; // Default to 15 minutes
  }
};

// Export configuration
const config = {
  env: envConfig.NODE_ENV,
  port: parseInt(envConfig.PORT, 10),
  host: envConfig.HOST,

  db: {
    url: envConfig.DATABASE_URL,
    host: envConfig.DB_HOST,
    port: parseInt(envConfig.DB_PORT, 10),
    name: envConfig.DB_NAME,
    user: envConfig.DB_USER,
    password: envConfig.DB_PASSWORD,
    ssl: envConfig.DB_SSL,

    pool: {
      max: parseInt(envConfig.DB_POOL_MAX, 10),
      min: parseInt(envConfig.DB_POOL_MIN, 10),
      acquire: parseInt(envConfig.DB_POOL_ACQUIRE, 10),
      idle: parseInt(envConfig.DB_POOL_IDLE, 10),
      evict: parseInt(envConfig.DB_POOL_EVICT, 10),
    },
  },

  jwt: {
    secret: envConfig.JWT_SECRET,
    expiresIn: envConfig.JWT_EXPIRES_IN,
    refreshExpiresIn: envConfig.JWT_REFRESH_EXPIRES_IN,
    cookieExpires: parseInt(envConfig.JWT_COOKIE_EXPIRES, 10),
  },

  cors: {
    origin: parseCorsOrigins(envConfig.CORS_ORIGIN),
    methods: parseCorsMethods(envConfig.CORS_METHODS),
    allowedHeaders: parseCorsAllowedHeaders(envConfig.CORS_ALLOWED_HEADERS),
    credentials: envConfig.CORS_CREDENTIALS === true,
    maxAge: parseInt(envConfig.CORS_MAX_AGE, 10),
  },

  rateLimit: {
    windowMs: parseRateLimitWindow(envConfig.RATE_LIMIT_WINDOW_MS),
    max: parseInt(envConfig.RATE_LIMIT_MAX, 10),
  },

  security: {
    helmet: envConfig.HELMET_ENABLED,
    csp: envConfig.CSP_ENABLED,
    hsts: envConfig.HSTS_ENABLED,
  },

  logging: {
    level: envConfig.LOG_LEVEL,
    toFile: envConfig.LOG_TO_FILE,
    dir: envConfig.LOG_DIR,
    maxSize: envConfig.LOG_MAX_SIZE,
    maxFiles: envConfig.LOG_MAX_FILES,
  },

  session: {
    secret: envConfig.SESSION_SECRET,
    cookie: {
      secure: envConfig.SECURE_COOKIES,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },

  api: {
    prefix: envConfig.API_PREFIX,
    docsPath: envConfig.API_DOCS_PATH,
    responseTimeout: parseInt(envConfig.API_RESPONSE_TIMEOUT, 10),
  },
};


export default config;
