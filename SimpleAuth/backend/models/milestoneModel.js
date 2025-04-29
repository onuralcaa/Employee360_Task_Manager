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
  title: { type: String, required: true },
  description: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'on-hold', 'submitted', 'verified', 'rejected'],
    default: 'todo'
  },
  createdAt: { type: Date, default: Date.now },
  _modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  _userRole: String
});

// Status transition validation
milestoneSchema.pre('save', function(next) {
  // Only run validation if status is modified
  if (!this.isModified('status')) return next();
  
  const allowedTransitions = {
    'todo': ['in-progress', 'on-hold'],
    'in-progress': ['submitted', 'on-hold'],
    'on-hold': ['in-progress', 'todo'],
    'submitted': ['verified', 'rejected'],
    'verified': [],
    'rejected': []
  };
  
  if (this.isNew) return next(); // New milestone, no transition validation needed
  
  // Get original document to check previous status
  this.constructor.findById(this._id)
    .then(oldDoc => {
      if (!oldDoc) return next();
      
      const oldStatus = oldDoc.status;
      const newStatus = this.status;
      
      // Check if transition is allowed
      if (oldStatus === newStatus || allowedTransitions[oldStatus].includes(newStatus)) {
        return next();
      }
      
      const err = new Error(`Invalid status transition from ${oldStatus} to ${newStatus}`);
      return next(err);
    })
    .catch(next);
});

const Milestone = mongoose.model("Milestone", milestoneSchema);

module.exports = Milestone;