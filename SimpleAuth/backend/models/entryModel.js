const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
  uid: { type: String, required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["giris", "cikis"],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Entry", entrySchema);
