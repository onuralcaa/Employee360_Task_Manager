const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  number: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true },     // 📧 E-posta eklendi
  birthdate: { type: Date, required: true },                 // 📅 Doğum Tarihi eklendi
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "personel"], default: "personel" }
});

module.exports = mongoose.model("User", userSchema);
