const express = require('express');
const router = express.Router();
const {
  createReport,
  getAllReports,
  getTeamLeaderReports,
  getReportById,
  submitReport,
  deleteReport,
  generateTextReport
} = require('../controllers/reportController');
const verifyToken = require('../middleware/authMiddleware');

// Create a new report
router.post('/', verifyToken, createReport);

// Get all reports (admin only)
router.get('/all', verifyToken, getAllReports);

// Get team leader reports
router.get('/team-leader', verifyToken, getTeamLeaderReports);

// Get a single report by ID
router.get('/:id', verifyToken, getReportById);

// Submit a report (change status from draft to submitted)
router.patch('/submit/:id', verifyToken, submitReport);

// Delete a report
router.delete('/:id', verifyToken, deleteReport);

// Generate a text report
router.get('/generate-text/:id', verifyToken, generateTextReport);

module.exports = router;