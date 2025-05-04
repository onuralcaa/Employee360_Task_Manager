const express = require("express");
const router = express.Router();
const upload = require("../multerConfig");
const {
  uploadFile,
  getRecipientsList,
  getFilesForRecipient,
  getFilesSentBySender,
  downloadFile,
  deleteFile
} = require("../controllers/fileController");
const verifyToken = require("../middleware/authMiddleware");

// 📌 Alıcıları getiren route (Admin veya Takım Lideri)
router.get("/recipients", verifyToken, getRecipientsList);

// 📤 Dosya yükleme route (Admin ve Takım Liderleri dosya gönderebilir)
router.post(
  "/upload",
  verifyToken,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        // Handle Multer errors and send them as JSON response
        return res.status(400).json({
          message: err.message
        });
      }
      next();
    });
  },
  uploadFile
);

// 📥 Kullanıcının aldığı dosyalar (gelen dosyalar)
router.get("/received", verifyToken, getFilesForRecipient);

// 📤 Kullanıcının gönderdiği dosyalar
router.get("/sent", verifyToken, getFilesSentBySender);

// 📥 Dosya indirme route'u
router.get("/download/:fileId", verifyToken, downloadFile);

// 🗑️ Dosya silme route'u (sadece admin)
router.delete("/:fileId", verifyToken, deleteFile);

module.exports = router;
