const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const auth = (requiredRole) => async (req, res, next) => {
  try {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = req.headers.authorization.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_key');
      const user = await User.findById(decoded.id)
        .select('-password');

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ message: 'Not authorized, insufficient permissions' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { auth };