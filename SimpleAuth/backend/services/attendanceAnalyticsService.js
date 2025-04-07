const Attendance = require('../models/attendanceModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

/**
 * Attendance Analytics Service - Provides aggregated attendance data and reports
 */

// Get attendance summary for a specific date range
const getAttendanceSummary = async (startDate, endDate) => {
  try {
    // Convert string dates to Date objects if needed
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    
    const summary = await Attendance.aggregate([
      {
        $match: {
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            userId: "$userId",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            type: "$type"
          },
          time: { $first: "$timestamp" }
        }
      },
      {
        $group: {
          _id: {
            userId: "$_id.userId",
            date: "$_id.date"
          },
          entry: {
            $min: {
              $cond: [{ $eq: ["$_id.type", "entry"] }, "$time", null]
            }
          },
          exit: {
            $max: {
              $cond: [{ $eq: ["$_id.type", "exit"] }, "$time", null]
            }
          }
        }
      },
      {
        $project: {
          userId: "$_id.userId",
          date: "$_id.date",
          entry: 1,
          exit: 1,
          hoursWorked: {
            $cond: [
              { $and: ["$entry", "$exit"] },
              { $divide: [{ $subtract: ["$exit", "$entry"] }, 3600000] }, // Convert ms to hours
              null
            ]
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          date: 1,
          userId: 1,
          entry: 1,
          exit: 1,
          hoursWorked: 1,
          "user.name": 1,
          "user.surname": 1,
          "user.department": 1,
          "user.position": 1,
          "user.employeeId": 1
        }
      },
      {
        $sort: { date: -1, "user.name": 1 }
      }
    ]);
    
    return summary;
  } catch (error) {
    throw error;
  }
};

// Get department attendance statistics
const getDepartmentStats = async (department, month, year) => {
  try {
    // Calculate date range for the given month and year
    const startDate = new Date(year, month - 1, 1); // Months are 0-indexed in JS Date
    const endDate = new Date(year, month, 0); // Last day of the month
    endDate.setHours(23, 59, 59, 999);
    
    // Get users in department
    const users = await User.find({ department }).select('_id name surname');
    const userIds = users.map(user => user._id);
    
    // Get attendance stats
    const stats = await Attendance.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            userId: "$userId",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.userId",
          totalDays: { $addToSet: "$_id.date" },
          lateCount: {
            $sum: {
              $cond: [{ $eq: ["$_id.status", "late"] }, 1, 0]
            }
          },
          onTimeCount: {
            $sum: {
              $cond: [{ $eq: ["$_id.status", "onTime"] }, 1, 0]
            }
          },
          earlyExitCount: {
            $sum: {
              $cond: [{ $eq: ["$_id.status", "earlyExit"] }, 1, 0]
            }
          },
          overtimeCount: {
            $sum: {
              $cond: [{ $eq: ["$_id.status", "overtime"] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$user.name",
          surname: "$user.surname",
          employeeId: "$user.employeeId",
          daysPresent: { $size: "$totalDays" },
          lateCount: 1,
          onTimeCount: 1,
          earlyExitCount: 1,
          overtimeCount: 1,
          attendanceRate: {
            $multiply: [
              { $divide: [{ $size: "$totalDays" }, { $subtract: [endDate.getDate(), startDate.getDate() + 1] }] },
              100
            ]
          }
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);
    
    return {
      department,
      month,
      year,
      stats
    };
  } catch (error) {
    throw error;
  }
};

// Get absences report
const getAbsencesReport = async (startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    // Get all users who should be working
    const users = await User.find({ isActive: true }).select('_id name surname department employeeId workSchedule');
    
    // Create an array of all work days in the date range
    const workDays = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      workDays.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Get all attendance records for the date range
    const attendanceRecords = await Attendance.find({
      type: 'entry',
      timestamp: { $gte: start, $lte: end }
    }).select('userId workDay');
    
    // Create a map of user attendance
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      const userId = record.userId.toString();
      const dateStr = record.workDay.toISOString().split('T')[0];
      
      if (!attendanceMap[userId]) {
        attendanceMap[userId] = new Set();
      }
      attendanceMap[userId].add(dateStr);
    });
    
    // Create absences report
    const absences = [];
    
    users.forEach(user => {
      const userId = user._id.toString();
      const userWorkDays = user.workSchedule?.workDays || [1, 2, 3, 4, 5]; // Default to Mon-Fri
      
      workDays.forEach(day => {
        const dayOfWeek = day.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const isWorkDay = userWorkDays.includes(dayOfWeek);
        
        if (isWorkDay) {
          const dateStr = day.toISOString().split('T')[0];
          const attended = attendanceMap[userId]?.has(dateStr);
          
          if (!attended) {
            absences.push({
              userId: user._id,
              name: user.name,
              surname: user.surname,
              employeeId: user.employeeId,
              department: user.department,
              date: day,
              dateStr
            });
          }
        }
      });
    });
    
    return absences.sort((a, b) => a.date - b.date);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAttendanceSummary,
  getDepartmentStats,
  getAbsencesReport
};