const mongoose = require('mongoose');

const allowedTransitions = {
  'todo': ['in-progress', 'on-hold'],
  'in-progress': ['submitted', 'on-hold'],
  'on-hold': ['in-progress', 'todo'],
  'submitted': ['verified', 'rejected'],
  'rejected': [],
  'verified': []
};

const milestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'on-hold', 'submitted', 'verified', 'rejected'],
    default: 'todo'
  },
  _modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  _userRole: String
});

// Add validation for status transitions
milestoneSchema.pre('save', async function(next) {
  if (this.isModified('status')) {
    // Skip validation for new documents
    if (this.isNew) {
      return next();
    }

    const oldStatus = this._previousStatus;
    const newStatus = this.status;

    if (!oldStatus || !allowedTransitions[oldStatus]?.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${oldStatus || 'undefined'} to ${newStatus}`);
    }

    // Validate admin actions
    if ((newStatus === 'verified' || newStatus === 'rejected') && 
        (!this._modifiedBy || this._userRole !== 'admin')) {
      throw new Error(`Only admins can ${newStatus} milestones`);
    }
  }
  next();
});

module.exports = mongoose.model('Milestone', milestoneSchema);