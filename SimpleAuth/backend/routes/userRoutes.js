const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * User Routes
 */

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes 
router.route('/profile')
  .get(protect, getUserProfile) 
  .put(protect, updateUserProfile);

// Admin-only routes (for future features)
router.get('/all', protect, admin, (req, res) => {
  res.json({ message: 'Admin route for getting all users' });
});

module.exports = router;
