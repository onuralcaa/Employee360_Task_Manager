const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'on-hold', 'done', 'verified', 'rejected'],
    default: 'todo'
  },
  _modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  _userRole: String
}, {
  timestamps: true
});

// Add validation for status transitions
taskSchema.pre('save', async function(next) {
  if (this.isModified('status')) {
    // Skip validation for new documents
    if (this.isNew) {
      return next();
    }

    const allowedTransitions = {
      'todo': ['in-progress', 'on-hold'],
      'in-progress': ['done', 'on-hold'],
      'on-hold': ['in-progress', 'todo'],
      'done': ['verified', 'rejected'],
      'verified': [],
      'rejected': []
    };

    const oldStatus = this._previousStatus;
    const newStatus = this.status;

    // Validate status transition
    if (!oldStatus || !allowedTransitions[oldStatus]?.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${oldStatus || 'undefined'} to ${newStatus}`);
    }

    // Validate admin actions
    if ((newStatus === 'verified' || newStatus === 'rejected') && 
        (!this._modifiedBy || this._userRole !== 'admin')) {
      throw new Error(`Only admins can ${newStatus} tasks`);
    }
  }
  next();
});

// Validate team membership
taskSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('assignedTo')) {
    const User = mongoose.model('User');
    const assignedUser = await User.findById(this.assignedTo);
    if (!assignedUser || String(assignedUser.team) !== String(this.team)) {
      throw new Error('User must be a member of the team');
    }
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);