const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: [4, "Kullanıcı adı en az 4 karakter olmalıdır."],
    validate: {
      validator: function (v) {
        return /^[a-zA-Z0-9]+$/.test(v);
      },
      message: props => `${props.value} geçersiz kullanıcı adı!`
    }
  },
  number: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  birthdate: { type: Date, required: true },
  password: {
    type: String,
    required: true,
    minlength: [6, "Şifre en az 6 karakter olmalıdır."],
    validate: {
      validator: function (v) {
        return /[a-zA-Z]/.test(v) && /[0-9]/.test(v);
      },
      message: () => "Şifre en az bir harf ve bir rakam içermelidir."
    }
  },
  role: {
    type: String,
    enum: ["admin", "personel"],
    default: "personel"
  },
  // ✅ Şifre sıfırlama için gerekli alanlar
  resetPasswordToken: String,
  resetPasswordExpire: Date
});


module.exports = mongoose.model("User", userSchema);
