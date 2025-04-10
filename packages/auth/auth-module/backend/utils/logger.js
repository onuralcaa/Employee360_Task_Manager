const winston = require('winston');

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
  winston.format.errors({ stack: true })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// Error handler helper
const handleError = (error) => {
  const status = error.status || 500;
  const message = error.message || 'An unexpected error occurred';
  
  // Log the error with stack trace in development
  if (process.env.NODE_ENV === 'development') {
    logger.error({
      message,
      status,
      stack: error.stack
    });
  } else {
    // Log without stack trace in production
    logger.error({
      message,
      status
    });
  }

  return {
    success: false,
    message,
    status,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };
};

// Create custom error
const createError = (message, status = 500) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

module.exports = {
  logger,
  handleError,
  createError
};