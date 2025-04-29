const express = require("express");
const router = express.Router();
const upload = require("../multerConfig");
const {
  uploadFile,
  getRecipientsList,
  getFilesForRecipient,
  getFilesSentBySender,
  downloadFile
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
router.get("/received", verifyToken, getFilesForRecipient);

// 📤 Kullanıcının gönderdiği dosyalar
router.get("/sent", verifyToken, getFilesSentBySender);

// 📥 Dosya indirme route'u
router.get("/download/:fileId", verifyToken, downloadFile);

module.exports = router;
