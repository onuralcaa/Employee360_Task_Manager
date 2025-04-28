const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");


// ✅ Kayıt
const register = async (req, res) => {
  try {
      const { name, surname, username, number, email, birthdate, password, role, team } = req.body;

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
      role: role || "personel",
      team // ✅ takım bilgisi artık user'a ekleniyor
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
      team: user.team, // ✅ eklendi
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
      team: user.team // ✅ eklendi
    });

  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Bu e-posta adresi sistemde kayıtlı değil." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 dk geçerli
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    const message = `
      <h3>Şifre Sıfırlama</h3>
      <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p><i>Bu bağlantı 10 dakika içinde geçerliliğini yitirecektir.</i></p>
    `;

    await sendEmail({
      to: user.email,
      subject: "Şifre Sıfırlama Bağlantısı",
      html: message,
    });

    res.status(200).json({ message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." });
  } catch (error) {
    res.status(500).json({ message: "Şifre sıfırlama e-postası gönderilemedi.", error });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Token geçersiz veya süresi dolmuş." });

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Şifreniz başarıyla güncellendi." });
  } catch (error) {
    res.status(500).json({ message: "Şifre sıfırlama işlemi başarısız oldu.", error });
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

// ✅ Tüm kullanıcıları getir (admin için)
const getAllPersonnel = async (req, res) => {
  try {
    const allUsers = await User.find({}, "name surname email _id role username team birthdate number");
    res.status(200).json(allUsers);
  } catch (error) {
    console.error("❌ Kullanıcı listesi alınamadı:", error);
    res.status(500).json({ message: "Kullanıcı listesi alınamadı", error });
  }
};

const getAllUsers = async (req, res) => {
  try {
    //console.log("🚀 getAllUsers çalıştı!"); // ✅ Bu log gelmeli
    //console.log("🟠 Gelen kullanıcı bilgisi (req.user):", req.user); // ✅ Token decode oldu mu?

    const users = await User.find({}, "name surname username email role team");
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Kullanıcılar alınamadı:", err);
    res.status(500).json({ message: "Kullanıcılar alınamadı", error: err });
  }
};


// ✅ Takım ID'sine göre kullanıcıları getir
const getUsersByTeamId = async (req, res) => {
  try {
    const teamUsers = await User.find({ team: req.params.teamId }); // ← projection kaldırıldı
    res.status(200).json(teamUsers);
  } catch (error) {
    res.status(500).json({ message: "Takım kullanıcıları alınamadı", error });
  }
};

// ✅ Kullanıcıyı sil
const deleteUser = async (req, res) => {
  try {
    // Token'dan gelen kullanıcı bilgisi (middleware'den geliyor)
    const requestingUser = req.user;

    // Yetki kontrolü: sadece admin silebilir
    if (requestingUser.role !== "admin") {
      return res.status(403).json({ message: "Bu işlemi yapmaya yetkiniz yok!" });
    }

    const { id } = req.params;
    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      return res.status(404).json({ message: "Silinecek kullanıcı bulunamadı." });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Kullanıcı başarıyla silindi." });
  } catch (error) {
    console.error("❌ Kullanıcı silme hatası:", error);
    res.status(500).json({ message: "Kullanıcı silinirken sunucu hatası oluştu.", error });
  }
};



module.exports = {
  register,
  login,
  updateUser,
  getUserById,
  getAllPersonnel,
  forgotPassword,
  resetPassword,
  getUsersByTeamId, // ✅ eklendi
  getAllUsers,
  deleteUser
};
