const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 📝 Kullanıcı Kaydı
const register = async (req, res) => {
  try {
    const { name, surname, username, number, password, role } = req.body;

    // Kullanıcı adı ve numara kontrolü
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Bu kullanıcı adı zaten kayıtlı!" });
    }

    const existingNumber = await User.findOne({ number });
    if (existingNumber) {
      return res.status(400).json({ message: "Bu numara zaten kayıtlı!" });
    }

    // Numaranın sayısal olup olmadığını kontrol et
    if (isNaN(number)) {
      return res.status(400).json({ message: "Numara sadece sayısal olabilir." });
    }

    // Şifre hashleme
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcı oluştur
    const newUser = new User({
      name,
      surname,
      username, // Kullanıcı adı eklendi
      number: Number(number),
      password: hashedPassword,
      role: role || "personel" // Varsayılan olarak personel atanıyor
    });

    await newUser.save();
    res.status(201).json({ message: "Kayıt başarılı!" });

  } catch (error) {
    res.status(500).json({ message: "Kayıt sırasında hata oluştu.", error });
  }
};

// 📝 Kullanıcı Girişi
const login = async (req, res) => {
  try {
    const { username, password } = req.body; // Kullanıcı adı ile giriş yapılıyor

    // Kullanıcıyı bul
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
    }

    // Şifre doğrulama
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Geçersiz şifre!" });
    }

    // JWT Token oluştur
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Başarı mesajı ve rol bilgisi döndür
    res.status(200).json({
      message: `${user.role === "admin" ? "Yönetici" : "Personel"} girişi başarılı.`,
      token,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error });
  }
};

module.exports = { register, login };
