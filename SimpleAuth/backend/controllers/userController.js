const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Kayıt
const register = async (req, res) => {
  try {
    const { name, surname, username, number, email, birthdate, password, role } = req.body;

    if (isNaN(number)) return res.status(400).json({ message: "Numara sadece sayısal olabilir." });

    // Benzersizlik kontrolleri
    const exists = await Promise.all([
      User.findOne({ username }),
      User.findOne({ number }),
      User.findOne({ email })
    ]);

    if (exists[0]) return res.status(400).json({ message: "Bu kullanıcı adı zaten kayıtlı!" });
    if (exists[1]) return res.status(400).json({ message: "Bu numara zaten kayıtlı!" });
    if (exists[2]) return res.status(400).json({ message: "Bu e-posta zaten kayıtlı!" });

    const hashedPassword = await bcrypt.hash(password, 10);

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
    res.status(500).json({ message: "Kayıt sırasında hata oluştu.", error });
  }
};

// ✅ Giriş
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user)
      return res.status(404).json({ message: "Kullanıcı bulunamadı!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Geçersiz şifre!" });

    const tokenPayload = {
      id: user._id,
      name: user.name,
      surname: user.surname,
      username: user.username,
      number: user.number,
      email: user.email,
      birthdate: user.birthdate,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: `${user.role === "admin" ? "Yönetici" : "Personel"} girişi başarılı.`,
      token,
      id: user._id,
      role: user.role,
      name: user.name,
      surname: user.surname,
      username: user.username,
      phone: user.number,
      email: user.email,
      birthdate: user.birthdate,
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error });
  }
};


// ✅ Kullanıcı güncelleme
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surname, username, phone, email, birthdate } = req.body;

    const updated = await User.findByIdAndUpdate(
      id,
      { name, surname, username, number: phone, email, birthdate },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    res.status(200).json({ message: "Bilgiler başarıyla güncellendi", updated });

  } catch (error) {
    res.status(500).json({ message: "Güncelleme sırasında hata oluştu", error });
  }
};

// ✅ Belirli kullanıcıyı ID ile getir
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Kullanıcı getirme hatası", error });
  }
};

// ✅ Tüm personelleri getir (admin için)
const getAllPersonnel = async (req, res) => {
  try {
    const allUsers = await User.find({}, "name surname email _id role");
    //console.log("📋 Tüm kullanıcılar:", allUsers);

    // role "personel" olanları filtrele (fazladan boşluklara karşı)
    const filtered = allUsers.filter(user => user.role.trim().toLowerCase() === "personel");

    res.status(200).json(filtered);
  } catch (error) {
    console.error("❌ Personel listesi alınamadı:", error);
    res.status(500).json({ message: "Personel listesi alınamadı", error });
  }
};


module.exports = {
  register,
  login,
  updateUser,
  getUserById,
  getAllPersonnel
};
