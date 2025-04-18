const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController.js");

const {
  register,
  login,
  updateUser,
  getUserById,
  getAllPersonnel,
  forgotPassword,   // ✅ yeni eklendi
  resetPassword     // ✅ yeni eklendi
} = controller;

// Kullanıcı işlemleri
router.post("/register", register);        // Kullanıcı kaydı
router.post("/login", login);              // Kullanıcı girişi
router.put("/:id", updateUser);            // Kullanıcı güncelle
router.get("/", getAllPersonnel);          // Tüm personelleri getir
router.get("/:id", getUserById);           // Belirli kullanıcıyı getir

// Şifre sıfırlama işlemleri
router.post("/forgot-password", forgotPassword);       // ✅ Şifremi unuttum - e-posta gönderir
router.post("/reset-password/:token", resetPassword);  // ✅ Token ile yeni şifre belirleme

module.exports = router;
