const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  number: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  birthdate: { type: Date, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "personel"], default: "personel" },
  // New fields for attendance tracking
  cardId: { type: String, unique: true, sparse: true },
  employeeId: { type: String, unique: true },
  department: { type: String },
  position: { type: String },
  workSchedule: {
    startTime: { type: String }, // Format: "HH:mm"
    endTime: { type: String },   // Format: "HH:mm"
    workDays: [{ type: Number }] // 0-6 representing Sunday-Saturday
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model("User", userSchema);
