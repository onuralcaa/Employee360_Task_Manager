const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const teamRoutes = require("./routes/teamRoutes");
const User = require("./models/userModel");
const Team = require("./models/teamModel");
const bcrypt = require("bcryptjs");
const messageRoutes = require("./routes/messageRoutes");
const fileRoutes = require("./routes/fileRoutes");

require("dotenv").config();

const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/files", fileRoutes);
app.use("/uploads", express.static("uploads")); // Dosyaları dışarıdan erişilebilir yapar


// 🚀 Takımları Otomatik Oluştur
const createDefaultTeams = async () => {
  const defaultTeams = [
    "Web Geliştirme",
    "Mobil Geliştirme",
    "Yapay Zeka Takımı",
    "Test Takımı"
  ];

  for (const teamName of defaultTeams) {
    const exists = await Team.findOne({ name: teamName });
    if (!exists) {
      await Team.create({ name: teamName });
      console.log(`✅ Takım oluşturuldu: ${teamName}`);
    } else {
      console.log(`ℹ️ Takım zaten mevcut: ${teamName}`);
    }
  }
};


// ✅ 2. Admin kullanıcı oluşturuluyor
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
        email: "admin@example.com",
        birthdate: "1970-01-01",
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

// ✅ 3. Takım liderleri oluşturuluyor
const createTeamLeaders = async () => {
  const leaders = [
    {
      name: "Web",
      surname: "Lideri",
      username: "weblead",
      number: 1111,
      email: "web@team.com",
      birthdate: "1990-01-01",
      password: "web123",
      teamName: "Web Geliştirme"
    },
    {
      name: "Mobil",
      surname: "Lideri",
      username: "mobilead",
      number: 2222,
      email: "mobile@team.com",
      birthdate: "1990-02-01",
      password: "mobil123",
      teamName: "Mobil Geliştirme"
    },
    {
      name: "YapayZeka",
      surname: "Lideri",
      username: "aiLead",
      number: 3333,
      email: "ai@team.com",
      birthdate: "1990-03-01",
      password: "ai123",
      teamName: "Yapay Zeka Takımı"
    },
    {
      name: "Test",
      surname: "Lideri",
      username: "testlead",
      number: 4444,
      email: "test@team.com",
      birthdate: "1990-04-01",
      password: "test123",
      teamName: "Test Takımı"
    }
  ];

  for (const leader of leaders) {
    const exists = await User.findOne({ username: leader.username });
    if (!exists) {
      const team = await Team.findOne({ name: leader.teamName });
      if (!team) {
        console.log(`❌ Takım bulunamadı: ${leader.teamName}`);
        continue;
      }

      const hashed = await bcrypt.hash(leader.password, 10);
      const newLeader = new User({
        name: leader.name,
        surname: leader.surname,
        username: leader.username,
        number: leader.number,
        email: leader.email,
        birthdate: leader.birthdate,
        password: hashed,
        role: "team_leader",
        team: team._id
      });

      await newLeader.save();
      console.log(`✅ ${leader.teamName} lideri oluşturuldu`);
    } else {
      console.log(`ℹ️ ${leader.username} zaten mevcut`);
    }
  }
};

// Sunucu başlatılırken takımlar, admin ve takım liderleri oluşturulacak
(async () => {
  await createDefaultTeams();     // ✅ Önce takımlar oluşsun
  await createAdminUser();
  await createTeamLeaders();
})();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server ${PORT} portunda çalışıyor!`));

const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes); // Task routes'u ekle

const milestoneRoutes = require("./routes/milestoneRoutes");
app.use("/api/milestones", milestoneRoutes); // Milestone routes'u ekle