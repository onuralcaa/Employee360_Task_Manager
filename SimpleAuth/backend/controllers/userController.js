const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { name, surname, number, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, surname, number, password: hashedPassword });
  await user.save();
  res.status(201).json({ message: "Kayıt başarılı!" });
};

const login = async (req, res) => {
  const { number, password } = req.body;
  const user = await User.findOne({ number });
  if (!user) return res.status(400).json({ message: "Kullanıcı bulunamadı!" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Şifre yanlış!" });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({ token, name: user.name });
};

module.exports = { register, login };
