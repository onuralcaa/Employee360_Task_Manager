const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true }); // ✅ Burayı ekledik! (createdAt ve updatedAt otomatik gelir)

module.exports = mongoose.model("File", fileSchema);

