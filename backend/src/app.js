import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import requestIp from 'request-ip';
import responseTime from 'response-time';
import { v4 as uuidv4 } from 'uuid';

// Import configuration
import envConfig from './config/env.js';
import sequelize from './config/db.js';

// Import middleware
import { errorHandler } from './middleware/error.js';
import { authenticate, authorize } from './middleware/auth.js';
import { rateLimiter } from './middleware/rateLimit.js';
import { requestLogger } from './middleware/requestLogger.js';
import securityHeaders from './middleware/securityHeaders.js';
import logger from './utils/logger.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import userRoutes from './routes/user.routes.js';
import healthRoutes from './routes/health.routes.js';
import salesRoutes from './routes/sales.routes.js';

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====================================
// Security Middleware
// ====================================

// Set security HTTP headers
if (envConfig.security.helmet) {
  app.use(helmet({
    contentSecurityPolicy: envConfig.security.csp ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    } : false,
    hsts: envConfig.security.hsts,
  }));
}

// Enable CORS with enhanced options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = Array.isArray(envConfig.cors.origin) 
      ? envConfig.cors.origin 
      : [envConfig.cors.origin];
      
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: envConfig.cors.methods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: envConfig.cors.allowedHeaders || [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Credentials'
  ],
  exposedHeaders: ['Authorization', 'X-Request-Id'],
  credentials: true, // Enable credentials
  maxAge: envConfig.cors.maxAge || 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Enable pre-flight across-the-board for all routes
app.options('*', cors(corsOptions));

// Parse JSON request body
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Parse cookies
app.use(cookieParser(envConfig.jwt.secret));

// Add request ID to each request
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
});

// Get client IP address
app.use(requestIp.mw());

// Response time header
app.use(responseTime());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'page',
    'limit',
    'sort',
    'fields',
    'search',
    'status',
  ],
}));

// Gzip compression
app.use(compression());

// Rate limiting
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Security headers
app.use(securityHeaders);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: envConfig.env === 'production' ? '1y' : 0, // Cache control for production
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.gz')) {
      res.setHeader('Content-Encoding', 'gzip');
      
      // Set appropriate content type based on file extension
      if (filePath.endsWith('.js.gz')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css.gz')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (filePath.endsWith('.json.gz')) {
        res.setHeader('Content-Type', 'application/json');
      }
    }
  }
}));

// Health check endpoint (public)
app.use(`${envConfig.api.prefix}/health`, healthRoutes);

// Public routes
app.use(`${envConfig.api.prefix}/auth`, authRoutes);

// Protected routes (require authentication)
app.use(authenticate);

// Role-based routes (protected)
app.use(`${envConfig.api.prefix}/products`, productRoutes);
app.use(`${envConfig.api.prefix}/users`, userRoutes);
app.use(`${envConfig.api.prefix}/sales`, salesRoutes);

// New routes for categories and customers
import categoriesRoutes from './routes/categories.routes.js';
import customersRoutes from './routes/customers.routes.js';
app.use(`${envConfig.api.prefix}/categories`, categoriesRoutes);
app.use(`${envConfig.api.prefix}/customers`, customersRoutes);

// Handle 404 - Not Found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Not Found',
    error: `Cannot ${req.method} ${req.originalUrl}`,
    requestId: req.id,
  });
});

// Error handling middleware
app.use(errorHandler);

// Health check endpoint with detailed information
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();
    
    // Get database stats
    const [results] = await sequelize.query('SELECT version()');
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
    
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      database: {
        status: 'connected',
        version: results[0]?.version || 'unknown',
        dialect: sequelize.getDialect(),
        database: sequelize.config.database,
        host: sequelize.config.host,
        port: sequelize.config.port,
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memory: {
          rss: formatMemoryUsage(memoryUsage.rss),
          heapTotal: formatMemoryUsage(memoryUsage.heapTotal),
          heapUsed: formatMemoryUsage(memoryUsage.heapUsed),
          external: formatMemoryUsage(memoryUsage.external),
        },
      },
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
      database: {
        status: 'disconnected',
        error: error.message,
      },
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../../frontend/build');
  
  // Serve static files
  app.use(express.static(clientBuildPath, {
    maxAge: '1y', // Cache static assets for 1 year
    etag: true, // Enable ETag
    lastModified: true, // Enable Last-Modified header
  }));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Serve index.html for all other routes
    res.sendFile(path.join(clientBuildPath, 'index.html'), {
      maxAge: 0, // Don't cache HTML
      etag: true,
      lastModified: true,
    });
  });
}

// Handle unhandled routes
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use((err, req, res, next) => {
  // Set default status code and message if not provided
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Log the error
  const errorDetails = {
    statusCode: err.statusCode,
    status: err.status,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    requestId: req.requestId,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  };
  
  // Log the error with the request ID for correlation
  logger.error(`[${req.requestId}] ${err.message}`, {
    error: errorDetails,
    stack: err.stack,
  });
  
  // Send error response
  const errorResponse = {
    success: false,
    status: err.status,
    message: err.message,
    requestId: req.requestId,
  };
  
  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = err.stack;
    errorResponse.stack = err.stack;
  }
  
  res.status(err.statusCode).json(errorResponse);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to use a process manager like PM2 to restart the process
  // For now, we'll just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // In production, you might want to use a process manager like PM2 to restart the process
  process.exit(1);
});

// Export the app and httpServer for testing and starting the server
export { app, httpServer };
