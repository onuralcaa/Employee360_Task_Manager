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
      validator: (v) => /^[a-zA-Z0-9]+$/.test(v),
      message: (props) => `${props.value} geçersiz kullanıcı adı!`
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
      validator: (v) => /[a-zA-Z]/.test(v) && /[0-9]/.test(v),
      message: () => "Şifre en az bir harf ve bir rakam içermelidir."
    }
  },
  role: {
    type: String,
    enum: ["admin", "team_leader", "personel"],
    default: "personel"
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team"
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, { timestamps: true }); // ✅ timestamps burada


module.exports = mongoose.model("User", userSchema);