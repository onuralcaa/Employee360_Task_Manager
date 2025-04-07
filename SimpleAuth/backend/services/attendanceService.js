const Attendance = require('../models/attendanceModel');
const User = require('../models/userModel');
const CardReader = require('../models/cardReaderModel');
const ErrorHandler = require('../utils/logger');

/**
 * Attendance Service - Handles business logic for attendance tracking
 */

// Record entry/exit
const recordAttendance = async (cardId, readerId, type) => {
  try {
    // Find user by card ID
    const user = await User.findOne({ cardId });
    if (!user) {
      throw new Error('Invalid card ID');
    }

    // Find reader
    const reader = await CardReader.findById(readerId);
    if (!reader) {
      throw new Error('Invalid reader ID');
    }

    // Get current time
    const now = new Date();
    const workDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Determine attendance status
    let status = 'onTime';
    if (type === 'entry') {
      // Parse work schedule time
      const [scheduleHours, scheduleMinutes] = user.workSchedule.startTime.split(':').map(Number);
      const scheduleTime = new Date(workDay);
      scheduleTime.setHours(scheduleHours, scheduleMinutes);

      // Compare current time with schedule
      if (now > scheduleTime) {
        const diffMinutes = Math.round((now - scheduleTime) / (1000 * 60));
        if (diffMinutes > 15) { // 15 minutes grace period
          status = 'late';
        }
      }
    } else if (type === 'exit') {
      // Parse work schedule time
      const [scheduleHours, scheduleMinutes] = user.workSchedule.endTime.split(':').map(Number);
      const scheduleTime = new Date(workDay);
      scheduleTime.setHours(scheduleHours, scheduleMinutes);

      // Compare current time with schedule
      if (now < scheduleTime) {
        status = 'earlyExit';
      } else if (now > scheduleTime) {
        const diffMinutes = Math.round((now - scheduleTime) / (1000 * 60));
        if (diffMinutes > 30) { // 30 minutes threshold for overtime
          status = 'overtime';
        }
      }
    }

    // Create attendance record
    const attendance = await Attendance.create({
      userId: user._id,
      cardId,
      readerId,
      type,
      timestamp: now,
      status,
      location: reader.location.name,
      workDay
    });

    return attendance;
  } catch (error) {
    ErrorHandler.logError(error);
    throw new Error(ErrorHandler.formatError(error).message);
  }
};

// Get attendance records for a user
const getUserAttendance = async (userId, startDate, endDate) => {
  try {
    const query = { userId };
    
    if (startDate && endDate) {
      query.workDay = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const records = await Attendance.find(query)
      .sort({ timestamp: -1 })
      .populate('readerId', 'location.name');

    return records;
  } catch (error) {
    ErrorHandler.logError(error);
    throw new Error(ErrorHandler.formatError(error).message);
  }
};

// Get daily attendance report
const getDailyReport = async (date = new Date()) => {
  try {
    const workDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nextDay = new Date(workDay);
    nextDay.setDate(nextDay.getDate() + 1);

    const records = await Attendance.aggregate([
      {
        $match: {
          workDay: {
            $gte: workDay,
            $lt: nextDay
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          users: { $push: '$userId' }
        }
      }
    ]);

    return records;
  } catch (error) {
    ErrorHandler.logError(error);
    throw new Error(ErrorHandler.formatError(error).message);
  }
};

module.exports = {
  recordAttendance,
  getUserAttendance,
  getDailyReport
};