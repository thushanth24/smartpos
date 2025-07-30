import morgan from 'morgan';
import { createRequestLog } from '../services/loggingService.js';
import envConfig from '../config/env.js';

// Custom token for request ID
morgan.token('id', (req) => req.id);

// Custom token for user ID
morgan.token('user', (req) => {
  return req.user ? req.user.id : 'anonymous';
});

// Custom token for response time in seconds with 3 decimal places
morgan.token('response-time-ms', (req, res) => {
  const time = res.getHeader('X-Response-Time');
  return time ? (time / 1000).toFixed(3) : '0.000';
});

// Request logger middleware
const requestLogger = (req, res, next) => {
  // Skip logging for health checks in production
  if (envConfig.env === 'production' && req.originalUrl === '/health') {
    return next();
  }

  const startHrTime = process.hrtime();
  
  // Store the original end function
  const originalEnd = res.end;
  
  // Override the end function to capture response time
  res.end = function(chunk, encoding) {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
    
    // Only set header if not already sent
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', elapsedTimeInMs.toFixed(3));
    }
    
    // Call the original end function
    originalEnd.call(res, chunk, encoding);
    
    // Log the request details after response is sent
    if (envConfig.env !== 'production' || res.statusCode < 400) {
      const logData = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        responseTime: elapsedTimeInMs,
        user: req.user ? req.user.id : null,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent') || '',
        referrer: req.get('referrer') || '',
        requestId: req.id,
        body: req.body
      };
      
      // Create log entry
      createRequestLog(logData);
    }
  };
  
  // Call next middleware
  next();
};
      query: req.query,
      params: req.params,
      // Don't log sensitive headers
      headers: {
        'content-type': req.get('content-type'),
        'accept': req.get('accept'),
        'origin': req.get('origin'),
      },
    };
    
    // Log to console in development
    if (envConfig.env === 'development') {
      console.log(JSON.stringify(logData, null, 2));
    }
    
    // Log to file/database in production
    if (envConfig.logging.enabled) {
      createRequestLog(logData).catch(error => {
        console.error('Failed to save request log:', error);
      });
    }
  });
  
  next();
};

// Morgan format string
const format = '[:date[iso]] :method :url :status :response-time-ms ms - :res[content-length] - :user@:remote-addr - :user-agent';

// Create morgan middleware with custom format
const morganMiddleware = morgan(format, {
  stream: {
    write: (message) => {
      if (envConfig.env !== 'test') {
        console.log(message.trim());
      }
    },
  },
  skip: (req) => {
    // Skip health check logging in production
    return envConfig.env === 'production' && req.originalUrl === '/health';
  },
});

export { requestLogger, morganMiddleware };

export default requestLogger;
