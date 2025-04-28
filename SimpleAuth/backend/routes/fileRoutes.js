const express = require("express");
const router = express.Router();
const upload = require("../multerConfig");
const {
  uploadFile,
  getRecipientsList,
  getFilesForRecipient,   // ✅ Eklendi!
  getFilesSentBySender    // ✅ Eklendi!
} = require("../controllers/fileController");
const verifyToken = require("../middleware/authMiddleware");

// 📌 Alıcıları getiren route (Admin veya Takım Lideri)
router.get("/recipients", verifyToken, getRecipientsList);

// 📤 Dosya yükleme route (Admin ve Takım Liderleri dosya gönderebilir)
router.post(
  "/upload",
  verifyToken,
  upload.single("file"),
  uploadFile
);

// 📥 Kullanıcının aldığı dosyalar (gelen dosyalar)
router.get("/received", verifyToken, getFilesForRecipient); // ✅ EKLENDİ!

// 📤 Kullanıcının gönderdiği dosyalar
router.get("/sent", verifyToken, getFilesSentBySender);     // ✅ EKLENDİ!

module.exports = router;
