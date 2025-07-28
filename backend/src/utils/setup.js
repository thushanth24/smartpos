import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import logger from './logger.js';
import { checkDatabaseConnection } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../..');

/**
 * Load environment variables from .env file
 */
const loadEnv = () => {
  const envPath = path.join(rootDir, '.env');
  
  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    const envExamplePath = path.join(rootDir, '.env.example');
    
    if (fs.existsSync(envExamplePath)) {
      logger.warn('.env file not found. Creating from .env.example...');
      fs.copyFileSync(envExamplePath, envPath);
      logger.info('Created .env file from .env.example');
    } else {
      throw new Error('Neither .env nor .env.example file found. Please create a .env file.');
    }
  }
  
  // Load environment variables
  dotenv.config({ path: envPath });
  logger.debug('Environment variables loaded');
};

/**
 * Validate required environment variables
 */
const validateEnv = () => {
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'CORS_ORIGIN',
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  logger.debug('Environment variables validated');
};

/**
 * Ensure required directories exist
 */
const ensureDirs = () => {
  const dirs = [
    path.join(rootDir, 'logs'),
    path.join(rootDir, 'uploads'),
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.debug(`Created directory: ${dir}`);
    }
  });
};

/**
 * Initialize the application
 */
const initialize = async () => {
  try {
    // Load environment variables
    loadEnv();
    
    // Validate environment variables
    validateEnv();
    
    // Ensure required directories exist
    ensureDirs();
    
    // Test database connection
    const dbStatus = await checkDatabaseConnection();
    if (!dbStatus) {
      throw new Error('Failed to connect to the database');
    }
    
    logger.info('Application initialized successfully');
    return true;
  } catch (error) {
    logger.error('Initialization failed:', error);
    process.exit(1);
  }
};

export { initialize };
export default initialize;
