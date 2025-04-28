const express = require("express");
const router = express.Router();
const {
  submitMilestone,
  verifyMilestone,
  sendMessage,
  getMessagesBetweenUsers,
  getMessagesByUserId   // ✅ EKLENDİ
} = require("../controllers/messageController", "../controllers/milestoneController");

// ✅ Mesaj gönder
router.post("/", sendMessage);

// ✅ Tek bir kullanıcıya ait tüm mesajları getir (gönderen veya alıcı)
router.get("/user/:userId", getMessagesByUserId);   // ✅ YENİ ROUTE

// ✅ İki kullanıcı arasındaki mesajları getir
router.get("/:user1/:user2", getMessagesBetweenUsers);

module.exports = router;
