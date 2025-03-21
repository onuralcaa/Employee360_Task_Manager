const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController.js");  // ✅ .js uzantısı ile import

console.log(controller); // ❗ Kontrol için log: { register: [Function], login: [Function] }

const { register, login } = controller;  // Fonksiyonları düzgün şekilde çıkar

router.post("/register", register);  // Kullanıcı kaydı
router.post("/login", login);        // Kullanıcı girişi

module.exports = router;
