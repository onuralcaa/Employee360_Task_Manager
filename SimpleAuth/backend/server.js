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

const messageRoutes = require("./routes/messageRoutes");
app.use("/api/messages", messageRoutes);

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

const PORT = parseInt(process.env.PORT, 10) || 5000; // PORT'u doğru şekilde al

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`🚀 Server ${port} portunda çalışıyor!`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`❌ Port ${port} kullanılıyor. Başka bir port deneniyor...`);
      startServer(port + 1); // Bir sonraki portu dene
    } else {
      console.error("❌ Sunucu başlatma hatası:", err);
    }
  });
};

startServer(PORT); // Sunucuyu başlat
