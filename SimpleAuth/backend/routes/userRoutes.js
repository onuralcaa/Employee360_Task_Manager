const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/userController");

router.post("/register", register);  // Kullanıcı kaydı
router.post("/login", login);  // Kullanıcı girişi (artık kullanıcı adı ve şifre ile)

module.exports = router;
