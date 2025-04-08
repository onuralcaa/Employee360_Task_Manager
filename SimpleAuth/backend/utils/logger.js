const winston = require('winston');

// Logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/hata.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/tüm.log' })
  ]
});

// Centralized error handling utility
class ErrorHandler {
  static formatError(error) {
    return {
      message: error.message || 'An unexpected error occurred.',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    };
  }

  static logError(error) {
    logger.error(error.message, { stack: error.stack }); // Use the logger instance here
  }
}

// filepath: d:\Github\Employee360_Task_Manager\SimpleAuth\backend\utils\logger.js
module.exports = logger; // Export logger
module.exports.ErrorHandler = ErrorHandler; // Export ErrorHandler