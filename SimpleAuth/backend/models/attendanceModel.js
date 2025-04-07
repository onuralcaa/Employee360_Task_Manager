const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardId: {
    type: String,
    required: true
  },
  readerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CardReader',
    required: true
  },
  type: {
    type: String,
    enum: ['entry', 'exit'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['onTime', 'late', 'earlyExit', 'overtime'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  workDay: {
    type: Date,  // Store the date without time for easy querying
    required: true
  },
  notes: String
}, {
  timestamps: true
});

// Index for efficient querying
attendanceSchema.index({ userId: 1, workDay: 1 });
attendanceSchema.index({ cardId: 1, timestamp: 1 });
attendanceSchema.index({ readerId: 1, timestamp: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);