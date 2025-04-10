/**
 * Shared error handling utilities for Employee360 Task Manager
 */

// Standard error codes used across the application
const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  
  // Authorization errors
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_DATA: 'INVALID_DATA',
  
  // Server errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // Request errors
  BAD_REQUEST: 'BAD_REQUEST',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
};

// Status code mapping
const StatusCodes = {
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.INVALID_CREDENTIALS]: 401,
  [ErrorCodes.TOKEN_EXPIRED]: 401,
  [ErrorCodes.TOKEN_INVALID]: 401,
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.ALREADY_EXISTS]: 409,
  [ErrorCodes.VALIDATION_ERROR]: 400,
  [ErrorCodes.INVALID_DATA]: 400,
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCodes.DATABASE_ERROR]: 500,
  [ErrorCodes.BAD_REQUEST]: 400,
  [ErrorCodes.TOO_MANY_REQUESTS]: 429,
};

/**
 * API Error class for consistent error responses
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {string} code - Error code from ErrorCodes
   * @param {string} message - Human-readable error message
   * @param {Object} details - Additional error details
   */
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = StatusCodes[code] || 500;
    this.details = details;
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
  
  /**
   * Format the error for API response
   * @returns {Object} Formatted error response
   */
  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        status: this.status,
        details: this.details,
        stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
      }
    };
  }
}

/**
 * Create an error handler middleware for Express
 * @returns {Function} Express middleware function
 */
const errorHandlerMiddleware = () => {
  return (err, req, res, next) => {
    const { logger } = require('../logger');
    
    // If the error is an ApiError, use its status and format
    if (err instanceof ApiError) {
      logger.error(`API Error: ${err.message}`, {
        code: err.code,
        status: err.status,
        details: err.details,
        stack: err.stack,
      });
      
      return res.status(err.status).json(err.toJSON());
    }
    
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const validationError = new ApiError(
        ErrorCodes.VALIDATION_ERROR,
        'Validation error',
        { errors: Object.values(err.errors).map(e => e.message) }
      );
      
      logger.error(`Validation Error: ${err.message}`, {
        details: Object.values(err.errors).map(e => e.message),
        stack: err.stack,
      });
      
      return res.status(validationError.status).json(validationError.toJSON());
    }
    
    // Default to internal server error
    const internalError = new ApiError(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      err.message || 'Internal Server Error'
    );
    
    logger.error(`Internal Server Error: ${err.message}`, {
      stack: err.stack,
    });
    
    return res.status(internalError.status).json(internalError.toJSON());
  };
};

module.exports = {
  ErrorCodes,
  StatusCodes,
  ApiError,
  errorHandlerMiddleware,
};