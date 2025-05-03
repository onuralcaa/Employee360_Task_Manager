const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
  uid: { type: String, required: true },
  name: { type: String, required: true }
}, { timestamps: true }); // ✅ createdAt ve updatedAt otomatik gelir

module.exports = mongoose.model("Entry", entrySchema);
