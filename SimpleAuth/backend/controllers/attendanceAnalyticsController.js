const asyncHandler = require('express-async-handler');
const attendanceAnalyticsService = require('../services/attendanceAnalyticsService');

/**
 * Attendance Analytics Controller - Handles HTTP requests for attendance reporting
 */

// @desc    Get attendance summary for a specific date range
// @route   GET /api/attendance/analytics/summary
// @access  Private (Admin)
const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    res.status(400);
    throw new Error('Lütfen başlangıç ve bitiş tarihlerini belirtin');
  }
  
  try {
    const summary = await attendanceAnalyticsService.getAttendanceSummary(startDate, endDate);
    res.status(200).json({
      success: true,
      count: summary.length,
      data: summary
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Get department attendance statistics
// @route   GET /api/attendance/analytics/department
// @access  Private (Admin)
const getDepartmentStats = asyncHandler(async (req, res) => {
  const { department, month, year } = req.query;
  
  if (!department || !month || !year) {
    res.status(400);
    throw new Error('Lütfen departman, ay ve yıl bilgilerini belirtin');
  }
  
  try {
    const stats = await attendanceAnalyticsService.getDepartmentStats(
      department,
      parseInt(month),
      parseInt(year)
    );
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Get absences report
// @route   GET /api/attendance/analytics/absences
// @access  Private (Admin)
const getAbsencesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    res.status(400);
    throw new Error('Lütfen başlangıç ve bitiş tarihlerini belirtin');
  }
  
  try {
    const absences = await attendanceAnalyticsService.getAbsencesReport(startDate, endDate);
    res.status(200).json({
      success: true,
      count: absences.length,
      data: absences
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  getAttendanceSummary,
  getDepartmentStats,
  getAbsencesReport
};