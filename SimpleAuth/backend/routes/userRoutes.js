const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController.js");

const {
  register,
  login,
  updateUser,
  getUserById,
  getAllPersonnel,
  forgotPassword,
  resetPassword,
  getUsersByTeamId // ✅ yeni eklendi
} = controller;

// Kullanıcı işlemleri
router.post("/register", register);
router.post("/login", login);
router.put("/:id", updateUser);
router.get("/", getAllPersonnel);
router.get("/:id", getUserById);

// Takıma göre kullanıcıları getir
router.get("/by-team/:teamId", getUsersByTeamId); // ✅ yeni route

// Şifre sıfırlama işlemleri
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
