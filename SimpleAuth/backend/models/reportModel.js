const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  team: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team', 
    required: true 
  },
  teamLeader: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  introduction: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  periodStart: { 
    type: Date, 
    required: true 
  },
  periodEnd: { 
    type: Date, 
    required: true 
  },
  status: {
    type: String,
    enum: ['draft', 'submitted'],
    default: 'draft'
  },
  fileName: {
    type: String
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Report', reportSchema);