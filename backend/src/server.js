import { httpServer, app } from './app.js';
import { testConnection, syncDatabase, closeConnection } from './config/db.js';
import logger from './utils/logger.js';
import { initialize as setupApp } from './utils/setup.js';
import envConfig from './config/env.js';

// Get configuration from environment
const { port, host, env } = envConfig;

// Initialize application and database
async function initializeApp() {
  try {
    // Test database connection
    await testConnection();
    
    // Sync all models with the database
    // In production, you might want to use migrations instead of sync()
    await syncDatabase({ 
      force: env === 'test', // Force sync in test environment
      alter: env === 'development' // Alter tables in development
    });
    
    // Initialize application setup
    await setupApp();
    logger.info('🚀 Application initialized');
    
    return true;
  } catch (error) {
    logger.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
}

// Event listener for HTTP server "error" event.
const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// Event listener for HTTP server "listening" event.
// Event listener for HTTP server "listening" event
const onListening = () => {
  const addr = httpServer.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  logger.debug(`Server is listening on ${bind}`);
};

// Start the HTTP server
const startServer = async () => {
  try {
    // Initialize the application
    await initializeApp();
    
    // Start listening on the specified port and host
    httpServer.listen(port, host, () => {
      const serverAddress = httpServer.address();
      const address = typeof serverAddress === 'string' 
        ? serverAddress 
        : `http://${serverAddress.address}:${serverAddress.port}`;
      
      logger.info(`🚀 Server running in ${env} mode at ${address}`);
      logger.info(`📚 API Documentation available at ${address}${envConfig.api.docsPath}`);
    });
    
    httpServer.on('error', onError);
    httpServer.on('listening', () => {
      const addr = httpServer.address();
      const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
      logger.debug(`Listening on ${bind}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to exit the process
  if (env === 'production') {
    logger.error('Unhandled Rejection, shutting down...');
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // In production, you might want to exit the process
  if (env === 'production') {
    logger.error('Uncaught Exception, shutting down...');
    process.exit(1);
  }
});

// Handle process termination
const gracefulShutdown = async () => {
  logger.info('🛑 Shutting down server...');
  
  // Close the HTTP server
  httpServer.close(async () => {
    logger.info('✅ HTTP server closed');
    
    try {
      // Close the database connection
      await closeConnection();
      logger.info('✅ Database connection closed');
      
      // Perform any other cleanup tasks here
      logger.info('🔄 Cleanup completed');
      
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });
  
  // Force close server after 10 seconds
  setTimeout(() => {
    logger.error('⏰ Forcing server shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for shutdown signals
process.on('SIGTERM', gracefulShutdown);
