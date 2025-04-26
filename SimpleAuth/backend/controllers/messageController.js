const Message = require("../models/messageModel");

// ✅ Mesaj gönder
const sendMessage = async (req, res) => {
  try {
    const { sender, recipient, content } = req.body;

    if (!sender || !recipient || !content) {
      return res.status(400).json({ message: "Zorunlu alanlar eksik!" });
    }

    const newMessage = new Message({ sender, recipient, content });
    await newMessage.save();

    res.status(201).json({ message: "Mesaj başarıyla gönderildi.", data: newMessage });
  } catch (error) {
    res.status(500).json({ message: "Mesaj gönderilemedi.", error });
  }
};

// ✅ İki kullanıcı arasındaki tüm mesajları getir (gelen + giden)
const getMessagesBetweenUsers = async (req, res) => {
  const { user1, user2 } = req.params;

  try {
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
    res.status(500).json({ message: "Mesajlar alınamadı.", error });
  }
};

// ✅ TEK BİR KULLANICIYA AİT TÜM MESAJLARI GETİR (gönderen veya alıcı)
const getMessagesByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
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
    res.status(500).json({ message: "Mesajlar alınamadı.", error });
  }
};

module.exports = {
  sendMessage,
  getMessagesBetweenUsers,
  getMessagesByUserId  // ✅ Buraya da ekledik!
};
