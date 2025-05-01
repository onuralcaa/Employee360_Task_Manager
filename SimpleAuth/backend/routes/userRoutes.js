const express = require("express");
const router = express.Router();
const {
  register,
  login,
  updateUser,
  getUserById,
  getAllPersonnel,
  forgotPassword,
  resetPassword,
  getAllUsers,
  getUsersByTeamId,
  deleteUser,
  toggleUserActiveStatus
} = require("../controllers/userController");

const verifyToken = require("../middleware/authMiddleware");

// Kullanıcı işlemleri
router.post("/register", register);
router.post("/login", login);
router.put("/:id", updateUser);

// 🟢 Önce spesifik "/all"
router.get("/all", verifyToken, getAllUsers);

// Takıma göre kullanıcıları getir
router.get("/by-team/:teamId", getUsersByTeamId);

// 🔥 En sonda ID bazlı getir
router.get("/:id", getUserById);

// Şifre sıfırlama işlemleri
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// ✅ Kullanıcı silme (admin yetkisi)
router.delete("/:id", verifyToken, deleteUser);

// ✅ Aktif / Deaktif durumu değiştirme (admin yetkisi)
router.patch("/status/:id", verifyToken, toggleUserActiveStatus);s

module.exports = router;