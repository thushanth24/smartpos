import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(process.cwd(), '.env');
dotenv.config({ path: envPath });

const env = process.env.NODE_ENV || 'development';

// Application configuration
const appConfig = {
  env,
  port: parseInt(process.env.PORT, 10) || 5000,
  isProduction: env === 'production',
  isDevelopment: env === 'development',
  isTest: env === 'test',
};

// JWT configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  cookieExpires: parseInt(process.env.JWT_COOKIE_EXPIRES, 10) || 30,
};

// CORS configuration
const corsConfig = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Rate limiting configuration
const rateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // Limit each IP to 100 requests per windowMs
};

// Database configuration
const dbConfig = {
  url: process.env.DATABASE_URL,
  testUrl: process.env.TEST_DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/smartpos_test',
  pool: {
    max: process.env.NODE_ENV === 'production' ? 20 : 10,
    min: process.env.NODE_ENV === 'production' ? 2 : 0,
    acquire: 30000,
    idle: 10000,
  },
};

// Validation configuration
const validationConfig = {
  abortEarly: false, // Return all validation errors, not just the first one
  stripUnknown: true, // Remove unknown properties from request body
};

// Logging configuration
const loggingConfig = {
  level: process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug'),
  dir: 'logs',
  maxFiles: '30d',
  maxSize: '20m',
};

// Export all configurations
const config = {
  app: appConfig,
  jwt: jwtConfig,
  cors: corsConfig,
  rateLimit: rateLimitConfig,
  db: dbConfig,
  validation: validationConfig,
  logging: loggingConfig,
};

export default config;
