const mongoose = require('mongoose');

const employeeProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Position name cannot exceed 100 characters']
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  skills: [{
    type: String,
    trim: true
  }],
  certifications: [{
    name: String,
    issueDate: Date,
    expiryDate: Date
  }],
  performanceReviews: [{
    date: Date,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: String,
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
employeeProfileSchema.index({ userId: 1 });
employeeProfileSchema.index({ department: 1 });

module.exports = mongoose.model('EmployeeProfile', employeeProfileSchema);