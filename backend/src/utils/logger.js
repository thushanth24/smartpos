import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import 'winston-daily-rotate-file';
import { format } from 'winston';
import { inspect } from 'util';
import chalk from 'chalk';

const { combine, timestamp, printf, colorize, align, errors } = winston.format;

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels and colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const ts = timestamp.replace('T', ' ').replace('Z', '');
  let log = `${chalk.gray(ts)} [${level}]: ${message}`;
  
  if (Object.keys(meta).length > 0) {
    log += `\n${inspect(meta, { colors: true, depth: 3 })}`;
  }
  
  if (stack) {
    log += `\n${stack}`;
  }
  
  return log;
});

// Custom format for file output
const fileFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const ts = timestamp.replace('T', ' ').replace('Z', '');
  let log = `${ts} [${level.toUpperCase()}]: ${message}`;
  
  if (Object.keys(meta).length > 0) {
    log += `\n${inspect(meta, { depth: 5 })}`;
  }
  
  if (stack) {
    log += `\n${stack}`;
  }
  
  return log;
});

// Ensure logs directory exists
const logDir = path.join(process.cwd(), 'logs');

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { 
    service: 'smartpos-backend',
    env: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        consoleFormat
      ),
      silent: process.env.NODE_ENV === 'test',
    }),
    // Daily rotate file for errors
    new winston.transports.DailyRotateFile({
      level: 'error',
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: combine(
        timestamp(),
        fileFormat
      ),
    }),
    // Daily rotate file for all logs
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: combine(
        timestamp(),
        fileFormat
      ),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      format: combine(
        timestamp(),
        fileFormat
      ),
    }),
  ],
  exitOnError: false, // Don't exit on handled exceptions
});

// Create a stream object for morgan
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Don't exit immediately, let the application handle it
});

export default logger;
