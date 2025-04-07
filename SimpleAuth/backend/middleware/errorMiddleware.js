/**
 * Error handling middleware for consistent error responses
 */

const logger = require('../utils/logger');

// Not Found middleware - Handle 404 errors
const notFound = (req, res, next) => {
  const error = new Error(`Bulunamadı - ${req.originalUrl}`);
  res.status(404);
  logger.warn('404 Bulunamadı', { url: req.originalUrl, method: req.method });
  next(error);
};

// Error handler middleware - Format and send error responses
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  logger.error('Hata oluştu', {
    mesaj: err.message,
    iz: process.env.NODE_ENV === 'production' ? null : err.stack,
    durumKodu: statusCode,
    url: req.originalUrl,
    metod: req.method,
    gövde: req.body
  });

  res.json({
    başarı: false,
    mesaj: err.message,
    iz: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { notFound, errorHandler };