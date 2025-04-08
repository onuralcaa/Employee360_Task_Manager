/**
 * Error handling middleware for consistent error responses
 */

const logger = require('../utils/logger');
// filepath: d:\Github\Employee360_Task_Manager\SimpleAuth\backend\middleware\errorMiddleware.js
const { ErrorHandler } = require('../utils/logger');

// Not Found middleware - Handle 404 errors
const notFound = (req, res, next) => {
  const error = new Error(`Bulunamadı - ${req.originalUrl}`);
  res.status(404);
  logger.warn('404 Bulunamadı', { url: req.originalUrl, method: req.method });
  next(error);
};

// filepath: d:\Github\Employee360_Task_Manager\SimpleAuth\backend\middleware\errorMiddleware.js
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  ErrorHandler.logError(err); // Correct usage
  res.json(ErrorHandler.formatError(err));
};

module.exports = { notFound, errorHandler };