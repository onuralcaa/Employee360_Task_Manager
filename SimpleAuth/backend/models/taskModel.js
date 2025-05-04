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

// Durum geçişleri için doğrulama ekle
taskSchema.pre('save', async function(next) {
  if (this.isModified('status')) {
    // Yeni belgeler için doğrulamayı atla
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

    const oldStatus = this._previousStatus || this.status;
    const newStatus = this.status;

    // Allow keeping the same status (no change)
    if (oldStatus === newStatus) {
      return next();
    }

    // Check if transition is allowed
    if (!allowedTransitions[oldStatus]?.includes(newStatus)) {
      throw new Error(`${oldStatus} durumundan ${newStatus} durumuna geçiş geçersiz`);
    }

    // Team leaders and admins can verify or reject
    if ((newStatus === 'verified' || newStatus === 'rejected') && 
        (!this._modifiedBy || (this._userRole !== 'admin' && this._userRole !== 'team_leader'))) {
      throw new Error(`Görevleri sadece yöneticiler veya takım liderleri ${newStatus} durumuna getirebilir`);
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