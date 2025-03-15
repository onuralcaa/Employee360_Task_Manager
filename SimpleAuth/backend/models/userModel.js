const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  username: { type: String, required: true, unique: true }, // Kullanıcı adı eklendi
  number: { type: Number, required: true, unique: true }, // Numara sayısal olacak
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "personel"], default: "personel" } // Rol ekledik
});

module.exports = mongoose.model("User", userSchema);
