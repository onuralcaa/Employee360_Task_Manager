const Message = require("../models/messageModel");
const User = require("../models/userModel"); // Added User model to check roles and teams

// ✅ Mesaj gönder - with permission validation
const sendMessage = async (req, res) => {
  try {
    const { sender, recipient, content } = req.body;
    const requestingUser = req.user; // Get authenticated user from middleware

    if (!sender || !recipient || !content) {
      return res.status(400).json({ message: "Zorunlu alanlar eksik!" });
    }

    // Verify that sender ID matches authenticated user ID (prevent spoofing)
    if (sender !== requestingUser.id) {
      console.log("❌ Sender ID mismatch: ", sender, requestingUser.id);
      return res.status(403).json({ message: "Başka bir kullanıcı adına mesaj gönderemezsiniz." });
    }

    // Get sender and recipient details from database
    const [senderUser, recipientUser] = await Promise.all([
      User.findById(sender),
      User.findById(recipient)
    ]);

    if (!senderUser || !recipientUser) {
      return res.status(404).json({ message: "Gönderen veya alıcı bulunamadı." });
    }

    // Check messaging permissions based on roles
    if (senderUser.role === "personel") {
      // Regular personnel can only message people on their own team
      const senderTeamId = senderUser.team ? senderUser.team.toString() : null;
      const recipientTeamId = recipientUser.team ? recipientUser.team.toString() : null;
      
      if (recipientUser.role === "admin") {
        console.log("❌ Personnel attempted to message admin");
        return res.status(403).json({ message: "Yöneticilere mesaj gönderme yetkiniz bulunmamaktadır." });
      }
      
      if (senderTeamId !== recipientTeamId) {
        console.log("❌ Personnel attempted to message user from another team");
        return res.status(403).json({ message: "Yalnızca kendi takımınızdaki kişilere mesaj gönderebilirsiniz." });
      }
    } else if (senderUser.role === "team_leader") {
      // Team leaders can message their team members and other team leaders
      const senderTeamId = senderUser.team ? senderUser.team.toString() : null;
      const recipientTeamId = recipientUser.team ? recipientUser.team.toString() : null;
      
      if (recipientUser.role === "personel" && senderTeamId !== recipientTeamId) {
        console.log("❌ Team leader attempted to message personnel from another team");
        return res.status(403).json({ message: "Yalnızca kendi takımınızdaki personele mesaj gönderebilirsiniz." });
      }
    }
    // Admins can message anyone - no restrictions

    const newMessage = new Message({ sender, recipient, content });
    await newMessage.save();

    res.status(201).json({ message: "Mesaj başarıyla gönderildi.", data: newMessage });
  } catch (error) {
    console.error("Mesaj gönderme hatası:", error);
    res.status(500).json({ message: "Mesaj gönderilemedi.", error: error.message });
  }
};

// ✅ İki kullanıcı arasındaki tüm mesajları getir (gelen + giden)
const getMessagesBetweenUsers = async (req, res) => {
  const { user1, user2 } = req.params;
  const requestingUser = req.user; // Get authenticated user from middleware

  try {
    // Security check: only allow access if the requesting user is one of the participants
    // or is an admin
    if (requestingUser.id !== user1 && requestingUser.id !== user2 && requestingUser.role !== "admin") {
      console.log("❌ Unauthorized attempt to view messages between users");
      return res.status(403).json({ message: "Bu mesajları görüntüleme yetkiniz bulunmamaktadır." });
    }

    // For personnel, ensure they're only viewing conversations within their team
    if (requestingUser.role === "personel") {
      // Get both users
      const [userOneData, userTwoData] = await Promise.all([
        User.findById(user1),
        User.findById(user2)
      ]);

      if (!userOneData || !userTwoData) {
        return res.status(404).json({ message: "Kullanıcılardan biri veya her ikisi bulunamadı." });
      }

      // Check if both users are from the same team as the requesting user
      const userOneTeam = userOneData.team ? userOneData.team.toString() : null;
      const userTwoTeam = userTwoData.team ? userTwoData.team.toString() : null;
      const requestingUserTeam = requestingUser.team ? requestingUser.team.toString() : null;

      if (userOneTeam !== requestingUserTeam || userTwoTeam !== requestingUserTeam) {
        console.log("❌ Personnel attempted to view messages outside their team");
        return res.status(403).json({ message: "Yalnızca kendi takımınızdaki üyeler arasındaki mesajları görüntüleyebilirsiniz." });
      }
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 }
      ]
    })
      .sort({ timestamp: 1 })
      .populate("sender", "name surname username")
      .populate("recipient", "name surname username");

    res.status(200).json(messages);
  } catch (error) {
    console.error("Mesaj getirme hatası:", error);
    res.status(500).json({ message: "Mesajlar alınamadı.", error: error.message });
  }
};

// ✅ TEK BİR KULLANICIYA AİT TÜM MESAJLARI GETİR (gönderen veya alıcı)
const getMessagesByUserId = async (req, res) => {
  const { userId } = req.params;
  const requestingUser = req.user; // Get authenticated user from middleware

  try {
    // Verify that the requesting user is only accessing their own messages
    // or has admin privileges
    if (userId !== requestingUser.id && requestingUser.role !== "admin") {
      console.log("❌ Unauthorized message access attempt:", requestingUser.username);
      return res.status(403).json({ message: "Yalnızca kendi mesajlarınızı görüntüleyebilirsiniz." });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    })
      .sort({ timestamp: 1 })
      .populate("sender", "name surname username")
      .populate("recipient", "name surname username");

    res.status(200).json(messages);
  } catch (error) {
    console.error("Mesaj getirme hatası:", error);
    res.status(500).json({ message: "Mesajlar alınamadı.", error: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessagesBetweenUsers,
  getMessagesByUserId  // ✅ Buraya da ekledik!
};
