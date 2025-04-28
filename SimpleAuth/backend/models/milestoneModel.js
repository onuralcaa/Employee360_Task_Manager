const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }, //leader
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'on-hold', 'submitted', 'verified'],
    default: 'todo',
  }
});

module.exports = mongoose.model('Milestone', milestoneSchema);