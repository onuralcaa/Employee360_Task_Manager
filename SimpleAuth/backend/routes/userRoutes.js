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
  deleteUser, // ✅ eklendi
} = require("../controllers/userController");

const verifyToken = require("../middleware/authMiddleware"); // ✅ burası eklendi!

// Kullanıcı işlemleri
router.post("/register", register);
router.post("/login", login);
router.put("/:id", updateUser);

// 🟢 ÖNCE spesifik "/all" gelsin!
router.get("/all", verifyToken, getAllUsers);

// Takıma göre kullanıcıları getir
router.get("/by-team/:teamId", getUsersByTeamId);

// 🔥 SONDA "/:id" olsun ki "all" veya "by-team" ile çakışmasın!
router.get("/:id", getUserById);

// Şifre sıfırlama işlemleri
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// ✅ Kullanıcı silme (admin yetkisi gerektirir!)
router.delete("/:id", verifyToken, deleteUser);

module.exports = router;
