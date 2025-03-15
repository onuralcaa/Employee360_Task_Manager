const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const User = require("./models/userModel"); // Kullanıcı modelini ekledik
const bcrypt = require("bcryptjs"); // Şifreleme için bcrypt kullanıyoruz
require("dotenv").config();

const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use("/api/users", userRoutes);

// 🚀 Yönetici Kullanıcısını Otomatik Oluştur
const createAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10); // Yönetici için default şifre
      const adminUser = new User({
        name: "admin",
        surname: "user",
        username: 'admin',
        number: 9999, // Örnek numara
        password: hashedPassword,
        role: "admin"
      });
      await adminUser.save();
      console.log("✅ Yönetici kullanıcısı oluşturuldu!");
    } else {
      console.log("ℹ️ Zaten bir yönetici kullanıcısı var.");
    }
  } catch (error) {
    console.error("❌ Yönetici oluşturma hatası:", error);
  }
};

// Sunucu başlatılırken yönetici oluştur
createAdminUser();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server ${PORT} portunda çalışıyor!`));
