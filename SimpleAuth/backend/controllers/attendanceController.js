const asyncHandler = require('express-async-handler');
const attendanceService = require('../services/attendanceService');

/**
 * Attendance Controller - Handles HTTP requests for attendance tracking
 */

// @desc    Record attendance (entry/exit)
// @route   POST /api/attendance/record
// @access  Private
const recordAttendance = asyncHandler(async (req, res) => {
  const { cardId, readerId, type } = req.body;

  if (!cardId || !readerId || !type) {
    res.status(400);
    throw new Error('Please provide cardId, readerId and type');
  }

  if (!['entry', 'exit'].includes(type)) {
    res.status(400);
    throw new Error('Type must be either entry or exit');
  }

  try {
    const attendance = await attendanceService.recordAttendance(cardId, readerId, type);
    res.status(201).json({
      success: true,
      message: `${type === 'entry' ? 'Giriş' : 'Çıkış'} kaydı başarıyla oluşturuldu`,
      data: attendance
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Get user's attendance records
// @route   GET /api/attendance/user/:userId
// @access  Private
const getUserAttendance = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const userId = req.params.userId;

  try {
    const records = await attendanceService.getUserAttendance(userId, startDate, endDate);
    res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Get daily attendance report
// @route   GET /api/attendance/report/daily
// @access  Private (Admin only)
const getDailyReport = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const reportDate = date ? new Date(date) : new Date();

  try {
    const report = await attendanceService.getDailyReport(reportDate);
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  recordAttendance,
  getUserAttendance,
  getDailyReport
};