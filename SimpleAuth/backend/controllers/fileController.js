const File = require("../models/fileModel");
const User = require("../models/userModel");

// 📤 Dosya Yükleme Fonksiyonu (Aynı kaldı)
const uploadFile = async (req, res) => {
  try {
    const { recipient } = req.body;

    if (!recipient) {
      return res.status(400).json({ message: "Alıcı seçilmedi." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Dosya yüklenemedi (req.file boş)." });
    }

    if (req.user.role !== "admin" && req.user.role !== "team_leader") {
      return res.status(403).json({ message: "Bu işlemi yapmaya yetkiniz yok." });
    }

    const newFile = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      sender: req.user.id,
      recipient: recipient,
    });

    await newFile.save();

    res.status(200).json({
      message: "Dosya başarıyla yüklendi ve gönderildi.",
      filePath: req.file.path,
      originalName: req.file.originalname,
    });
  } catch (error) {
    console.error("Upload sırasında hata:", error);
    res.status(500).json({ message: "Dosya yüklenemedi. Hata: " + error.message });
  }
};

// Kullanıcıya gelen dosyaları listele
const getFilesForRecipient = async (req, res) => {
  try {
    const files = await File.find({ recipient: req.user.id })
      .populate("sender", "name surname role") // 🟢 Gönderenin ad, soyad ve rolü
      .sort({ uploadDate: -1 });               // En son gelenler üstte
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Dosyalar alınamadı. Hata: " + error.message });
  }
};

// Kullanıcının gönderdiği dosyaları listele
const getFilesSentBySender = async (req, res) => {
  try {
    const files = await File.find({ sender: req.user.id })
      .populate("recipient", "name surname role") // 🟢 Alıcının ad, soyad ve rolü
      .sort({ uploadDate: -1 });                 // En son gönderilenler üstte
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Gönderdiğiniz dosyalar alınamadı. Hata: " + error.message });
  }
};


// 📌 Alıcıları getirme fonksiyonu (Aynı kaldı)
const getRecipientsList = async (req, res) => {
  try {
    let recipients;
    if (req.user.role === "admin") {
      recipients = await User.find({ role: "team_leader" });
    } else if (req.user.role === "team_leader") {
      recipients = await User.find({
        $or: [{ role: "team_leader" }, { role: "admin" }],
        _id: { $ne: req.user.id },
      });
    } else {
      return res.status(403).json({ message: "Bu işlemi yapmaya yetkiniz yok." });
    }
    res.status(200).json(recipients);
  } catch (error) {
    res.status(500).json({ message: "Alıcılar alınamadı. Hata: " + error.message });
  }
};

module.exports = { uploadFile, getFilesForRecipient, getFilesSentBySender, getRecipientsList };
