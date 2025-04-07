const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

/**
 * Authentication middleware for protecting routes
 */

// Protect routes - Verify user authentication
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_key');

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Token verification failed:', error.message, '\nStack Trace:', error.stack);
      res.status(401);
      throw new Error('Yetkisiz erişim, token geçersiz');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Yetkisiz erişim, token bulunamadı');
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