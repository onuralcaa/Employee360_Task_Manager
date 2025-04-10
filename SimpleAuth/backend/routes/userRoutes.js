const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController.js");  // ✅ .js uzantısı ile import

const { register, login, updateUser } = controller; // updateUser fonksiyonu eklendi

// Kullanıcı işlemleri
router.post("/register", register);  // Kullanıcı kaydı
router.post("/login", login);        // Kullanıcı girişi
router.put("/:id", updateUser); //Kullanıcı bilgisi güncelleme



module.exports = router;
