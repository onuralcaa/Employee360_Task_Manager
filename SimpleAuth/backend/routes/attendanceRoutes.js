const express = require('express');
const router = express.Router();
const {
  recordAttendance,
  getUserAttendance,
  getDailyReport
} = require('../controllers/attendanceController');
const {
  getAttendanceSummary,
  getDepartmentStats,
  getAbsencesReport
} = require('../controllers/attendanceAnalyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * Attendance Routes
 */

// Record attendance (scanning card)
router.post('/record', protect, recordAttendance);

// Get user's attendance records
router.get('/user/:userId', protect, getUserAttendance);

// Admin-only routes for reports
router.get('/report/daily', protect, admin, getDailyReport);

// Analytics endpoints (admin only)
router.get('/analytics/summary', protect, admin, getAttendanceSummary);
router.get('/analytics/department', protect, admin, getDepartmentStats);
router.get('/analytics/absences', protect, admin, getAbsencesReport);

module.exports = router;