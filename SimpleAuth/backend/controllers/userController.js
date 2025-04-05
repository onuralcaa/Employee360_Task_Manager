const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 📝 Kullanıcı Kaydı
const register = async (req, res) => {
  try {
    const { name, surname, username, number, email, birthdate, password, role } = req.body;

    // Kullanıcı adı, numara ve email kontrolü
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Bu kullanıcı adı zaten kayıtlı!" });
    }

    const existingNumber = await User.findOne({ number });
    if (existingNumber) {
      return res.status(400).json({ message: "Bu numara zaten kayıtlı!" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Bu e-posta zaten kayıtlı!" });
    }

    if (isNaN(number)) {
      return res.status(400).json({ message: "Numara sadece sayısal olabilir." });
    }

    // Şifre hashleme
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcı oluştur
    const newUser = new User({
      name,
      surname,
      username,
      number: Number(number),
      email,
      birthdate,
      password: hashedPassword,
      role: role || "personel"
    });

    await newUser.save();
    res.status(201).json({ message: "Kayıt başarılı!" });

  } catch (error) {
    console.error("❌ Error during registration:", error);
    res.status(500).json({ message: "An error occurred during registration.", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password, role: requestedRole } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
    }

   if (user.role !== requestedRole) {
  return res.status(403).json({ message: `Bu bilgiler ile ${requestedRole === "admin" ? "Yönetici" : "Personel"} girişi yapılamaz.` });
}


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Geçersiz şifre!" });
    }

    const tokenPayload = {
      id: user._id,
      name: user.name,
      surname: user.surname,
      username: user.username,
      number: user.number,
      email: user.email,
      birthdate: user.birthdate,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: `${user.role === "admin" ? "Yönetici" : "Personel"} girişi başarılı.`,
      token,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error });
  }
};

module.exports = {
  register,
  login
};

