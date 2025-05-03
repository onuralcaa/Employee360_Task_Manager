import { useEffect, useState } from "react";
import {
  getMessagesByUserId,
  sendMessage,
  getAllUsers,
} from "../api/api";
import "./Messages.css";

function PersonnelMessages({ user }) { // 🔥 user prop'u PersonelPanel'den gelecek
  const state = user;

  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    if (!state?.id) return;

    getMessagesByUserId(state.id)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Mesajlar alınamadı", err));

    getAllUsers()
      .then((res) => setAllUsers(res.data))
      .catch((err) => console.error("Kullanıcılar alınamadı", err));
  }, [state?.id]);

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
    return (
      user.team === state.team &&
      (user.role === "personel" || user.role === "team_leader")
    );
  });

  return (
    <div className="msg-wrapper">
      <h3>📨 Mesajlaşma Paneli (Personel)</h3>

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
            <small>{msg.timestamp ? new Date(msg.timestamp).toLocaleString() : "Tarih bilgisi yok"}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PersonnelMessages;
