import helmet from 'helmet';
import envConfig from '../config/env.js';

/**
 * Security headers middleware
 * Applies various security headers to responses
 */
const securityHeaders = (req, res, next) => {
  // Set security headers using helmet
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  if (envConfig.security.csp) {
    const cspDirectives = {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        // Add any trusted script sources here
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for some UI libraries
        // Add any trusted style sources here
      ],
      imgSrc: [
        "'self'",
        'data:',
        'https:', // For external images
        // Add any trusted image sources here
      ],
      connectSrc: [
        "'self'",
        // Add any trusted API endpoints here
      ],
      fontSrc: [
        "'self'",
        'data:',
        // Add any trusted font sources here
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
      blockAllMixedContent: true,
      upgradeInsecureRequests: envConfig.env === 'production',
    };

    // Set CSP header
    const cspHeader = Object.entries(cspDirectives)
      .map(([key, values]) => {
        if (Array.isArray(values)) {
          return `${key} ${values.join(' ')}`;
        }
        return `${key} ${values}`;
      })
      .join('; ');

    res.setHeader('Content-Security-Policy', cspHeader);
  }

  // Feature Policy (renamed to Permissions Policy in newer browsers)
  const featurePolicy = [
    "accelerometer 'none'",
    "camera 'none'",
    "geolocation 'none'",
    "gyroscope 'none'",
    "magnetometer 'none'",
    "microphone 'none'",
    "payment 'none'",
    "usb 'none'"
  ].join('; ');

  res.setHeader('Feature-Policy', featurePolicy);
  
  // Permissions Policy (replaces Feature Policy in newer browsers)
  const permissionsPolicy = [
    "accelerometer=()",
    "camera=()",
    "geolocation=()",
    "gyroscope=()",
    "magnetometer=()",
    "microphone=()",
    "payment=()",
    "usb=()"
  ].join(', ');

  res.setHeader('Permissions-Policy', permissionsPolicy);
  
  // HSTS (HTTP Strict Transport Security)
  if (envConfig.security.hsts && envConfig.env === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }
  
  // X-Powered-By: We don't want to expose this
  res.removeHeader('X-Powered-By');
  
  next();
};

export default securityHeaders;
