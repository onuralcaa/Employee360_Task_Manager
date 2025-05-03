const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMessagesBetweenUsers,
  getMessagesByUserId
} = require("../controllers/messageController");
const verifyToken = require("../middleware/authMiddleware");

// ✅ Mesaj gönder - with authentication middleware
router.post("/", verifyToken, sendMessage);

// ✅ Tek bir kullanıcıya ait tüm mesajları getir (gönderen veya alıcı)
router.get("/user/:userId", verifyToken, getMessagesByUserId);

// ✅ İki kullanıcı arasındaki mesajları getir
router.get("/:user1/:user2", verifyToken, getMessagesBetweenUsers);

module.exports = router;
