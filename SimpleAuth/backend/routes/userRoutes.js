const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  assignCardToUser,
  updateWorkSchedule,
  getUsers,
  getUsersByDepartment
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

// Admin-only routes
router.get('/', protect, admin, getUsers);
router.get('/department/:department', protect, admin, getUsersByDepartment);

// Card and work schedule management (admin only)
router.post('/:id/assign-card', protect, admin, assignCardToUser);
router.put('/:id/work-schedule', protect, admin, updateWorkSchedule);

// Add a new route to fetch all users for the admin panel
router.get('/admin/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Exclude passwords
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
