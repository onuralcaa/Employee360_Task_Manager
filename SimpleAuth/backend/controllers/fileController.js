const File = require("../models/fileModel");
const User = require("../models/userModel");
const path = require("path");
const fs = require("fs");

// 📤 Dosya Yükleme Fonksiyonu
const uploadFile = async (req, res) => {
  try {
    const { recipient } = req.body;

    if (!recipient) {
      return res.status(400).json({ message: "Alıcı seçilmedi." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Dosya yüklenemedi. Lütfen tekrar deneyin." });
    }

    if (req.user.role !== "admin" && req.user.role !== "team_leader") {
      return res.status(403).json({ message: "Bu işlemi yapmaya yetkiniz yok." });
    }

    // Use the properly encoded originalFileName from multerConfig if available
    const originalFileName = req.originalFileName || req.file.originalname;

    // Store original file info
    const fileInfo = {
      filename: req.file.filename,
      originalName: originalFileName, // Use the properly encoded filename
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      sender: req.user.id,
      recipient: recipient
    };

    const newFile = new File(fileInfo);
    await newFile.save();

    res.status(200).json({
      message: "Dosya başarıyla yüklendi ve gönderildi.",
      file: fileInfo
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
      .populate("sender", "name surname role")
      .sort({ createdAt: -1 });
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Dosyalar alınamadı. Hata: " + error.message });
  }
};

// Kullanıcının gönderdiği dosyaları listele
const getFilesSentBySender = async (req, res) => {
  try {
    const files = await File.find({ sender: req.user.id })
      .populate("recipient", "name surname role")
      .sort({ createdAt: -1 });
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Gönderdiğiniz dosyalar alınamadı. Hata: " + error.message });
  }
};

// Dosya indirme fonksiyonu
const downloadFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    if (!fileId) {
      return res.status(400).json({ message: "Dosya ID'si gereklidir." });
    }
    
    // Dosyayı veritabanından bul
    const file = await File.findById(fileId);
    
    if (!file) {
      return res.status(404).json({ message: "Dosya bulunamadı." });
    }
    
    // Kullanıcının bu dosyayı indirme yetkisi var mı kontrol et
    // Kullanıcı ya dosyayı gönderen ya da alıcı olmalı veya admin olmalı
    if (
      req.user.role !== "admin" && 
      file.sender.toString() !== req.user.id && 
      file.recipient.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Bu dosyayı indirme yetkiniz yok." });
    }
    
    // Dosyanın tam yolunu belirle
    const filePath = path.join(__dirname, '../uploads', file.filename);
    
    // Dosyanın var olup olmadığını kontrol et
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Dosya sunucuda bulunamadı." });
    }
    
    // Get the original filename with proper encoding
    const originalFileName = file.originalName || file.originalname || "downloaded-file";
    
    // Set appropriate headers for special characters in filenames
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(originalFileName)}`);
    res.setHeader('Content-Type', file.mimetype);
    
    // Send the file as a stream
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error("Dosya indirme hatası:", error);
    res.status(500).json({ message: "Dosya indirilemedi. Hata: " + error.message });
  }
};

// 📌 Alıcıları getirme fonksiyonu
const getRecipientsList = async (req, res) => {
  try {
    let recipients;
    if (req.user.role === "admin") {
      recipients = await User.find({ role: { $in: ["team_leader", "personel"] } });
    } else if (req.user.role === "team_leader") {
      recipients = await User.find({
        $or: [
          { role: "admin" },
          { role: "team_leader", _id: { $ne: req.user.id } },
          { role: "personel", team: req.user.team }
        ]
      });
    } else {
      return res.status(403).json({ message: "Bu işlemi yapmaya yetkiniz yok." });
    }
    res.status(200).json(recipients);
  } catch (error) {
    res.status(500).json({ message: "Alıcılar alınamadı. Hata: " + error.message });
  }
};

module.exports = { 
  uploadFile, 
  getFilesForRecipient, 
  getFilesSentBySender, 
  getRecipientsList,
  downloadFile
};
