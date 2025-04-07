const winston = require('winston');

// Logger örneği oluştur
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

module.exports = logger;

// Centralized error handling utility
class ErrorHandler {
  static formatError(error) {
    return {
      message: error.message || 'An unexpected error occurred.',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    };
  }

  static logError(error) {
    const logger = require('./logger');
    logger.error(error.message, { stack: error.stack });
  }
}

module.exports = ErrorHandler;