const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { logger } = require('../utils/logger'); // Import logger

const auth = (requiredRole) => async (req, res, next) => {
  try {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      logger.warn('Authorization header missing or malformed', { ip: req.ip }); // Log missing token
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = req.headers.authorization.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_key');
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        logger.warn('User not found for provided token', { userId: decoded.id }); // Log user not found
        return res.status(401).json({ message: 'User not found' });
      }

      if (requiredRole && user.role !== requiredRole) {
        logger.warn('Insufficient permissions', { userId: user.id, requiredRole }); // Log insufficient permissions
        return res.status(403).json({ message: 'Not authorized, insufficient permissions' });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logger.warn('Token expired', { ip: req.ip }); // Log token expiration
        return res.status(401).json({ message: 'Token expired' });
      }

      logger.error('Invalid token', { error: error.message, ip: req.ip }); // Log invalid token
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    logger.error('Unexpected error in auth middleware', { error: error.message }); // Log unexpected errors
    next(error);
  }
};

module.exports = { auth };