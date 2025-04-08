const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { logger, createError } = require('../utils/logger');

const auth = (requiredRole) => asyncHandler(async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw createError('Not authorized, no token', 401);
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'jwt_secret_key'
    );

    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw createError('User not found', 401);
    }

    if (requiredRole && user.role !== requiredRole) {
      throw createError('Not authorized, insufficient permissions', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw createError('Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      throw createError('Token expired', 401);
    }
    throw error;
  }
});

module.exports = auth;