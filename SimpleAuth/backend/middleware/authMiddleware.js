const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/logger');

/**
 * Authentication middleware for protecting routes
 */

// Protect routes - Verify user authentication
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_key');
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      ErrorHandler.logError(error);
      res.status(401).json(ErrorHandler.formatError(error));
    }
  } else {
    const error = new Error('Yetkisiz erişim, token bulunamadı');
    ErrorHandler.logError(error);
    res.status(401).json(ErrorHandler.formatError(error));
  }
});

// Admin middleware - Check if user is an admin
const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Yetkisiz erişim, admin yetkisi gerekli');
  }
});

// Personnel middleware - Check if user is a personnel
const personnel = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'personel') {
    next();
  } else {
    res.status(403);
    throw new Error('Yetkisiz erişim, personel yetkisi gerekli');
  }
});

module.exports = { protect, admin, personnel };