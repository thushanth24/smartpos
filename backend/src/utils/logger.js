const winston = require('winston');
const path = require('path');

const { combine, timestamp, printf, colorize, align } = winston.format;

// Define log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  const ts = timestamp.replace('T', ' ').replace('Z', '');
  return `${ts} ${level}: ${stack || message}`;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    align(),
    logFormat
  ),
  defaultMeta: { service: 'smartpos-backend' },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to `combined.log`
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create a stream for morgan to use with winston
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
