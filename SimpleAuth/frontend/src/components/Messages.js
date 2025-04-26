import { useEffect, useState } from "react";
import {
  getMessagesByUserId,
  sendMessage,
  getAllUsers,
} from "../api/api";
import "./Messages.css";

function Messages({ user }) { // ✅ user prop'u alındı
  const state = user; // ✅ state yerine gelen props



  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [text, setText] = useState("");

useEffect(() => {
  console.log("👤 Aktif kullanıcı:", state);
  console.log("📋 Tüm kullanıcılar:", allUsers);

  if (!state?.id) return;

  getMessagesByUserId(state.id)
    .then((res) => setMessages(res.data))
    .catch((err) => console.error("Mesajlar alınamadı", err));

  getAllUsers()
    .then((res) => {
      console.log("✅ Backend'den gelen kullanıcı listesi:", res.data);
      setAllUsers(res.data);
    })
    .catch((err) => console.error("Kullanıcılar alınamadı", err));

}, [state?.id]); // ❗️ KAPATILMASI GEREKEN PARANTEZ BURASI



  const handleSend = async () => {
    if (!receiverId || !text.trim()) return;

    try {
      const newMessage = {
        sender: state.id,
        recipient: receiverId,
        content: text.trim(),
      };
      await sendMessage(newMessage);
      setText("");
      setReceiverId("");
      const res = await getMessagesByUserId(state.id);
      setMessages(res.data);
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
    }
  };

  const filteredRecipients = allUsers.filter((user) => {
    if (user._id === state.id) return false;

    if (state.role === "admin") return true;

    if (state.role === "team_leader") {
      return (
        user.role === "admin" ||
        user.role === "team_leader" ||
        user.team === state.team
      );
    }

    if (state.role === "personel") {
      return (
        user.team === state.team &&
        (user.role === "personel" || user.role === "team_leader")
      );
    }

    return false;
  });

  return (
    <div className="msg-wrapper">
      <h3>📨 Mesajlaşma Paneli</h3>

      <div className="msg-send-box">
        <select
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
        >
          <option value="">Alıcı Seç</option>
          {filteredRecipients.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} {user.surname} ({user.role})
            </option>
          ))}
        </select>

        <textarea
          placeholder="Mesajınızı yazın..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button onClick={handleSend}>Gönder</button>
      </div>

      <div className="msg-list">
        <h4>📬 Mesajlar</h4>
        {messages.map((msg) => (
          <div key={msg._id} className="msg-item">
            <p>
              <strong>{msg.sender?.name || "?"}</strong> ➡{" "}
              <strong>{msg.recipient?.name || "?"}</strong>
            </p>
            <p>{msg.content}</p>
            <small>{new Date(msg.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Messages;
