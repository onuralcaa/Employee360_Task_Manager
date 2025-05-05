const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: false }, // Changed to optional for backward compatibility
  size: { type: Number, required: false },     // Changed to optional for backward compatibility
  data: { type: Buffer, required: false },     // Changed to optional for backward compatibility
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  corrupted: { type: Boolean, default: false }, // Track problematic files
  corruptedReason: { type: String } // Store reason for corruption
}, { timestamps: true }); // createdAt ve updatedAt otomatik gelir

module.exports = mongoose.model("File", fileSchema);

