/**
 * Request Logging Middleware
 * Houston Mobile Notary Pros API
 */

import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/requests.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Capture original end function
  const originalEnd = res.end;
  
  // Override res.end to capture response details
  res.end = function(chunk, encoding) {
    // Restore original end
    res.end = originalEnd;
    
    // Call original end
    res.end(chunk, encoding);
    
    // Log request details
    const duration = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'Unknown',
      contentLength: req.get('Content-Length') || 0,
      referer: req.get('Referer') || '',
      contentType: req.get('Content-Type') || '',
      // Only log body for POST/PUT/PATCH and if not too large
      ...(shouldLogBody(req) && {
        requestBody: sanitizeBody(req.body)
      }),
      // Response details
      responseSize: res.get('Content-Length') || 0,
      responseContentType: res.get('Content-Type') || ''
    };

    // Determine log level based on status code
    if (res.statusCode >= 500) {
      logger.error('Request completed with server error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed with client error', logData);
    } else if (res.statusCode >= 300) {
      logger.info('Request completed with redirect', logData);
    } else {
      logger.info('Request completed successfully', logData);
    }

    // Additional logging for slow requests (>2 seconds)
    if (duration > 2000) {
      logger.warn('Slow request detected', {
        ...logData,
        warning: 'Request took longer than 2 seconds'
      });
    }
  };

  // Continue to next middleware
  next();
};

/**
 * Determine if request body should be logged
 */
function shouldLogBody(req) {
  // Only log body for certain methods
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    return false;
  }

  // Don't log if body is too large
  const contentLength = parseInt(req.get('Content-Length') || '0');
  if (contentLength > 10000) { // 10KB limit
    return false;
  }

  // Don't log certain sensitive endpoints
  const sensitiveEndpoints = ['/webhooks/stripe', '/auth/login'];
  if (sensitiveEndpoints.some(endpoint => req.originalUrl.includes(endpoint))) {
    return false;
  }

  return true;
}

/**
 * Sanitize request body for logging
 */
function sanitizeBody(body) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'authorization',
    'credit_card', 'creditCard', 'card_number', 'cardNumber',
    'cvv', 'ssn', 'social_security_number'
  ];

  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  });

  // Recursively sanitize nested objects
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeBody(sanitized[key]);
    }
  });

  return sanitized;
}

/**
 * Security-focused request logger for webhooks
 */
const webhookRequestLogger = (req, res, next) => {
  const logData = {
    timestamp: new Date().toISOString(),
    type: 'webhook',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent') || 'Unknown',
    contentLength: req.get('Content-Length') || 0,
    headers: {
      contentType: req.get('Content-Type'),
      signature: req.get('x-ghl-signature') ? '[PRESENT]' : '[MISSING]',
      timestamp: req.get('x-timestamp') || '[NOT_PROVIDED]'
    },
    security: req.webhookSecurity || {}
  };

  logger.info('Webhook request received', logData);
  next();
};

/**
 * Performance monitoring middleware
 */
const performanceLogger = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    const perfData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      duration: `${duration.toFixed(2)}ms`,
      statusCode: res.statusCode,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };

    // Log performance data
    if (duration > 1000) { // Log slow requests (>1 second)
      logger.warn('Performance alert - slow request', perfData);
    } else if (process.env.NODE_ENV === 'development') {
      logger.debug('Performance data', perfData);
    }
  });

  next();
};

export {
  requestLogger,
  webhookRequestLogger,
  performanceLogger
}; 