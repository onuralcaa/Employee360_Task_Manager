const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const User = require("./models/userModel");
const bcrypt = require("bcryptjs");
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
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const adminUser = new User({
        name: "admin",
        surname: "user",
        username: "admin",
        number: 9999,
        email: "admin@example.com",         // 📧 Eklendi
        birthdate: "1970-01-01",            // 📅 Eklendi
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
