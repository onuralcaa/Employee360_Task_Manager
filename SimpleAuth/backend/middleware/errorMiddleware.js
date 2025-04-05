/**
 * Error handling middleware for consistent error responses
 */

// Not Found middleware - Handle 404 errors
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Error handler middleware - Format and send error responses
const errorHandler = (err, req, res, next) => {
  // Set status code (use 500 if status code is not set or is 200)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  
  // Send error response
  res.json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };