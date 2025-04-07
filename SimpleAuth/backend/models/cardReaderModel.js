const mongoose = require("mongoose");

const cardReaderSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    name: { type: String, required: true },
    floor: String,
    building: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  type: {
    type: String,
    enum: ['entry', 'exit', 'both'],
    default: 'both'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  lastPing: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  firmwareVersion: String,
  maintenanceLog: [{
    date: Date,
    type: String,
    description: String,
    technician: String
  }],
  settings: {
    timeoutSeconds: { type: Number, default: 5 },
    allowMultipleScans: { type: Boolean, default: false },
    requirePinCode: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Index for efficient querying
cardReaderSchema.index({ deviceId: 1 });
cardReaderSchema.index({ 'location.name': 1 });
cardReaderSchema.index({ status: 1 });

module.exports = mongoose.model("CardReader", cardReaderSchema);