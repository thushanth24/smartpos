import { httpServer, app } from './app.js';
import { checkDatabaseConnection } from './utils/db.js';
import logger from './utils/logger.js';
import { initialize as setupApp } from './utils/setup.js';

// Initialize application
await setupApp();

// Get port from environment and store in Express.
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Event listener for HTTP server "error" event.
const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

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
const onListening = () => {
  const addr = httpServer.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  logger.info(`Server running in ${NODE_ENV} mode on ${bind}`);
};

// Start the HTTP server
const startServer = () => {
  // Start server
  httpServer.listen(PORT);
  httpServer.on('error', onError);
  httpServer.on('listening', onListening);
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Consider whether to exit the process or not
  // process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Consider whether to exit the process or not
  // process.exit(1);
});

// Handle SIGTERM signal (e.g., from Docker stop)
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle process termination
const gracefulShutdown = () => {
  logger.info('Shutting down server...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force close server after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for shutdown signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
