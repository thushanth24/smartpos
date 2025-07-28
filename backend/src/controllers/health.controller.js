import { checkDatabaseConnection } from '../utils/db.js';

/**
 * @desc    Health check endpoint
 * @route   GET /health
 * @access  Public
 */
const healthCheck = async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await checkDatabaseConnection();
    
    const healthCheck = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus ? 'CONNECTED' : 'DISCONNECTED',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};

export { healthCheck };
export default { healthCheck };
