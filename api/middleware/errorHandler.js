/**
 * Error Handling Middleware
 * Houston Mobile Notary Pros API
 */

import winston from 'winston';

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log' }),
    new winston.transports.Console()
  ]
});

/**
 * Custom API Error class
 */
class APIError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle different types of errors
 */
function handleError(error, req) {
  const errorResponse = {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    errorResponse.error = 'Database Error';
    
    // Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference
    switch (error.code) {
      case 'P2002': // Unique constraint failed
        errorResponse.error = 'Duplicate Entry';
        errorResponse.message = 'A record with this information already exists';
        errorResponse.statusCode = 409; // Conflict
        break;
      case 'P2003': // Foreign key constraint failed
        errorResponse.error = 'Relationship Error';
        errorResponse.message = 'Related record not found';
        errorResponse.statusCode = 400;
        break;
      case 'P2025': // Record not found
        errorResponse.error = 'Not Found';
        errorResponse.message = 'The requested record was not found';
        errorResponse.statusCode = 404;
        break;
      default:
        errorResponse.message = 'A database error occurred';
        errorResponse.statusCode = 500;
    }
  }
  
  // Prisma validation error
  else if (error.name === 'PrismaClientValidationError') {
    errorResponse.error = 'Validation Error';
    errorResponse.message = 'Invalid data provided to database';
    errorResponse.statusCode = 400;
  }

  // MongoDB/Mongoose errors - keeping for backward compatibility
  else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    errorResponse.error = 'Database Error';
    errorResponse.message = 'A database error occurred';
    errorResponse.statusCode = 500;
  }
  
  // Mongoose validation errors
  else if (error.name === 'ValidationError') {
    errorResponse.error = 'Validation Error';
    errorResponse.message = 'Invalid data provided';
    errorResponse.details = Object.values(error.errors).map(err => err.message);
    errorResponse.statusCode = 400;
  }
  
  // Mongoose cast errors (invalid ObjectId, etc.)
  else if (error.name === 'CastError') {
    errorResponse.error = 'Invalid ID';
    errorResponse.message = 'Invalid ID format provided';
    errorResponse.statusCode = 400;
  }
  
  // JWT errors
  else if (error.name === 'JsonWebTokenError') {
    errorResponse.error = 'Authentication Error';
    errorResponse.message = 'Invalid or expired token';
    errorResponse.statusCode = 401;
  }
  
  // JWT token expired error
  else if (error.name === 'TokenExpiredError') {
    errorResponse.error = 'Authentication Error';
    errorResponse.message = 'Token has expired';
    errorResponse.statusCode = 401;
  }
  
  // Custom API errors
  else if (error instanceof APIError) {
    errorResponse.error = error.message;
    errorResponse.message = error.message;
    errorResponse.statusCode = error.statusCode;
  }
  
  // Express validator errors
  else if (error.type === 'entity.parse.failed') {
    errorResponse.error = 'Invalid JSON';
    errorResponse.message = 'Request body contains invalid JSON';
    errorResponse.statusCode = 400;
  }

  // Rate limiting errors
  else if (error.type === 'entity.too.large') {
    errorResponse.error = 'Payload Too Large';
    errorResponse.message = 'Request payload exceeds size limit';
    errorResponse.statusCode = 413;
  }
  
  // Multer file upload errors
  else if (error.code === 'LIMIT_FILE_SIZE') {
    errorResponse.error = 'File Too Large';
    errorResponse.message = 'Uploaded file exceeds size limit';
    errorResponse.statusCode = 413;
  }
  
  // Invalid content type
  else if (error.status === 415) {
    errorResponse.error = 'Unsupported Media Type';
    errorResponse.message = 'The content type is not supported';
    errorResponse.statusCode = 415;
  }

  // Set default status code if not set
  if (!errorResponse.statusCode) {
    errorResponse.statusCode = error.statusCode || 500;
  }

  return errorResponse;
}

/**
 * Main error handling middleware
 */
const errorHandler = (error, req, res, next) => {
  // Don't handle if response already sent
  if (res.headersSent) {
    return next(error);
  }

  const errorResponse = handleError(error, req);
  
  // Log the error
  logger.error('API Error occurred', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.method !== 'GET' ? req.body : undefined
    },
    response: {
      statusCode: errorResponse.statusCode
    }
  });

  // Send error response
  res.status(errorResponse.statusCode).json({
    success: false,
    ...errorResponse,
    // Only include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack 
    })
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  const error = {
    error: 'Not Found',
    message: `The endpoint ${req.method} ${req.originalUrl} was not found`,
    statusCode: 404,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /health',
      'GET /api/bookings/pending-payments',
      'POST /api/bookings/sync',
      'PATCH /api/bookings/pending-payments',
      'POST /webhooks/ghl',
      'POST /webhooks/stripe'
    ]
  };

  logger.warn('404 - Endpoint not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    success: false,
    ...error
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error formatter
 */
const validationErrorFormatter = (errors) => {
  return errors.map(error => ({
    field: error.param,
    message: error.msg,
    value: error.value
  }));
};

export {
  APIError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validationErrorFormatter
}; 