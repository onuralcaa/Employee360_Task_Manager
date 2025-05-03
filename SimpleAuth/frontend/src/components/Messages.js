import React, { useEffect, useState } from "react";
import { getAllUsers, sendMessage, getMessagesByUserId } from "../api/api";
import "./Messages.css";

function Messages({ user }) {
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        
        // Filter out the current user from the list
        const filteredUsers = response.data.filter(u => 
          (user.id && u._id !== user.id) || (user._id && u._id !== user._id)
        );
        
        setRecipients(filteredUsers);
        
        // Select the first user by default if one exists and no recipient is selected
        if (filteredUsers.length > 0 && !recipient) {
          setRecipient(filteredUsers[0]._id);
        }
      } catch (err) {
        console.error("Kullanıcılar yüklenirken hata:", err);
        setError("Kullanıcılar yüklenemedi. Lütfen daha sonra tekrar deneyin.");
      }
    };

    fetchUsers();
  }, [user, recipient]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const userId = user.id || user._id;
        if (!userId) return;

        const response = await getMessagesByUserId(userId);
        
        setMessages(response.data);
        setError("");
      } catch (err) {
        console.error("Mesajlar yüklenirken hata:", err);
        setError("Mesajlar yüklenemedi. Lütfen daha sonra tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError("Lütfen bir mesaj yazın.");
      return;
    }
    
    if (!recipient) {
      setError("Lütfen bir alıcı seçin.");
      return;
    }
    
    try {
      setLoading(true);
      
      // Get the user ID (ensuring we have it in the correct format)
      const userId = user.id || user._id;
      
      if (!userId) {
        setError("Kullanıcı kimliği bulunamadı. Lütfen tekrar giriş yapın.");
        setLoading(false);
        return;
      }
      
      await sendMessage({
        content: message,
        recipient: recipient,
        sender: userId  // Add the sender ID
      });
      
      setMessage("");
      setSuccess("Mesaj başarıyla gönderildi!");
      
      // Refresh messages
      const response = await getMessagesByUserId(userId);
      
      setMessages(response.data);
      setError("");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Mesaj gönderilirken hata:", err);
      setError("Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Tarihi formatla
  const formatDate = (dateString) => {
    if (!dateString) return "Tarih bilgisi yok";
    const date = new Date(dateString);
    return date.toLocaleString("tr-TR");
  };

  // Kullanıcı adını getir
  const getUserName = (userId) => {
    const user = recipients.find((u) => u._id === userId);
    if (!user) return "Bilinmeyen Kullanıcı";
    return `${user.name || ""} ${user.surname || ""}`.trim() || user.username || "Bilinmeyen Kullanıcı";
  };

  // Mesajı gönderen sen misin?
  const isSentByMe = (senderId) => {
    return (user.id && senderId === user.id) || (user._id && senderId === user._id);
  };

  return (
    <div className="msg-wrapper">
      <h3>📨 Mesajlar</h3>
      
      <div className="msg-send-box">
        <select 
          value={recipient} 
          onChange={(e) => setRecipient(e.target.value)}
        >
          <option value="">Alıcı Seçin</option>
          {recipients.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} {user.surname} - {user.role === "admin" ? "Yönetici" : user.role === "team_leader" ? "Takım Lideri" : "Personel"}
            </option>
          ))}
        </select>
        
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mesajınızı yazın..."
        />
        
        <button onClick={handleSendMessage} disabled={loading}>
          {loading ? "Gönderiliyor..." : "Gönder"}
        </button>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>
      
      <div className="msg-list">
        <h4>Son Mesajlar</h4>
        
        {loading && <p className="loading-message">Mesajlar yükleniyor...</p>}
        
        {!loading && messages.length === 0 && (
          <p className="no-messages">Henüz mesaj yok.</p>
        )}
        
        {!loading && messages.length > 0 && (
          <div>
            {messages.map((msg) => (
              <div 
                key={msg._id} 
                className={`msg-item ${isSentByMe(msg.sender?._id) ? "sent" : "received"}`}
              >
                <p>
                  <strong>
                    {isSentByMe(msg.sender?._id) 
                      ? "Siz" 
                      : msg.sender?.name 
                        ? `${msg.sender.name} ${msg.sender.surname}` 
                        : "Bilinmeyen Gönderici"}
                  </strong>
                  {isSentByMe(msg.sender?._id) 
                    ? ` → ${msg.recipient?.name ? `${msg.recipient.name} ${msg.recipient.surname}` : "Bilinmeyen Alıcı"}`
                    : ""}
                </p>
                <p>{msg.content}</p>
                <small>{formatDate(msg.timestamp || msg.createdAt)}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Messages;
