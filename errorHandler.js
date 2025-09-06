/**
 * Global error handling middleware
 * This should be the last middleware in the application
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let error = {
    success: false,
    error: {
      message: 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR'
    }
  };

  let statusCode = 500;

  // Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        const target = err.meta?.target;
        if (target?.includes('email')) {
          error.error.message = 'Email already exists';
          error.error.code = 'EMAIL_EXISTS';
        } else if (target?.includes('username')) {
          error.error.message = 'Username already exists';
          error.error.code = 'USERNAME_EXISTS';
        } else if (target?.includes('isbn')) {
          error.error.message = 'ISBN already exists';
          error.error.code = 'ISBN_EXISTS';
        } else {
          error.error.message = 'Duplicate entry found';
          error.error.code = 'DUPLICATE_ENTRY';
        }
        statusCode = 409;
        break;

      case 'P2025':
        // Record not found
        error.error.message = 'Record not found';
        error.error.code = 'RECORD_NOT_FOUND';
        statusCode = 404;
        break;

      case 'P2003':
        // Foreign key constraint violation
        error.error.message = 'Referenced record does not exist';
        error.error.code = 'FOREIGN_KEY_VIOLATION';
        statusCode = 400;
        break;

      case 'P2014':
        // Required relation missing
        error.error.message = 'Required relation is missing';
        error.error.code = 'RELATION_VIOLATION';
        statusCode = 400;
        break;

      default:
        error.error.message = 'Database operation failed';
        error.error.code = 'DATABASE_ERROR';
        statusCode = 500;
    }
  }

  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    error.error.message = 'Invalid token';
    error.error.code = 'INVALID_TOKEN';
    statusCode = 401;
  }

  else if (err.name === 'TokenExpiredError') {
    error.error.message = 'Token has expired';
    error.error.code = 'TOKEN_EXPIRED';
    statusCode = 401;
  }

  // Validation errors (Joi)
  else if (err.name === 'ValidationError' || err.isJoi) {
    error.error.message = err.details ? err.details[0].message : err.message;
    error.error.code = 'VALIDATION_ERROR';
    error.error.details = err.details;
    statusCode = 400;
  }

  // Mongoose CastError (invalid ObjectId)
  else if (err.name === 'CastError') {
    error.error.message = 'Invalid ID format';
    error.error.code = 'INVALID_ID';
    statusCode = 400;
  }

  // Custom application errors
  else if (err.statusCode) {
    statusCode = err.statusCode;
    error.error.message = err.message;
    error.error.code = err.code || 'APPLICATION_ERROR';
    if (err.details) {
      error.error.details = err.details;
    }
  }

  // Parse errors (malformed JSON)
  else if (err.type === 'entity.parse.failed') {
    error.error.message = 'Invalid JSON format in request body';
    error.error.code = 'INVALID_JSON';
    statusCode = 400;
  }

  // Request entity too large
  else if (err.type === 'entity.too.large') {
    error.error.message = 'Request payload too large';
    error.error.code = 'PAYLOAD_TOO_LARGE';
    statusCode = 413;
  }

  // Syntax errors
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error.error.message = 'Invalid JSON syntax';
    error.error.code = 'INVALID_JSON_SYNTAX';
    statusCode = 400;
  }

  // Network/Connection errors
  else if (err.code === 'ECONNREFUSED') {
    error.error.message = 'Database connection refused';
    error.error.code = 'DB_CONNECTION_ERROR';
    statusCode = 503;
  }

  else if (err.code === 'ENOTFOUND') {
    error.error.message = 'Database host not found';
    error.error.code = 'DB_HOST_ERROR';
    statusCode = 503;
  }

  // Rate limiting errors
  else if (err.statusCode === 429) {
    error.error.message = 'Too many requests, please try again later';
    error.error.code = 'RATE_LIMIT_EXCEEDED';
    statusCode = 429;
  }

  // File upload errors
  else if (err.code === 'LIMIT_FILE_SIZE') {
    error.error.message = 'File size too large';
    error.error.code = 'FILE_TOO_LARGE';
    statusCode = 413;
  }

  else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.error.message = 'Unexpected file field';
    error.error.code = 'UNEXPECTED_FILE';
    statusCode = 400;
  }

  // Add request information in development
  if (process.env.NODE_ENV === 'development') {
    error.error.details = {
      ...error.error.details,
      stack: err.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    };
  }

  // Send error response
  res.status(statusCode).json(error);
};

/**
 * 404 handler for unknown routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND',
      details: {
        method: req.method,
        url: req.originalUrl,
        timestamp: new Date().toISOString()
      }
    }
  });
};

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch any unhandled promise rejections
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Helper function to create standardized error responses
 */
const createError = (message, statusCode = 500, code = null, details = null) => {
  return new AppError(message, statusCode, code, details);
};

// Process unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Close server & exit process
  process.exit(1);
});

// Process uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  createError
};