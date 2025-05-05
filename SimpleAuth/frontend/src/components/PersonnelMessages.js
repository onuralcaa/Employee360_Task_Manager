import { useEffect, useState } from "react";
import {
  getMessagesByUserId,
  sendMessage,
  getAllUsers,
} from "../api/api";
import "./Messages.css";

function PersonnelMessages({ user }) {
  const state = user;

  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [text, setText] = useState("");
  
  // State to track currently selected conversation
  const [currentConversation, setCurrentConversation] = useState([]);

  useEffect(() => {
    if (!state?.id) return;

    // Load messages
    getMessagesByUserId(state.id)
      .then((res) => {
        setMessages(res.data);
        // If a recipient is selected, filter conversations immediately
        if (receiverId) {
          filterConversation(receiverId, res.data);
        }
      })
      .catch((err) => console.error("Mesajlar alınamadı", err));

    // Get all users with logging for debugging
    getAllUsers()
      .then((res) => {
        console.log("Personnel Messages - All users:", res.data);
        // Log users by role for debugging
        const admins = res.data.filter(u => u.role === 'admin');
        console.log("Personnel Messages - Admin users:", admins);
        setAllUsers(res.data);
      })
      .catch((err) => console.error("Kullanıcılar alınamadı", err));
  }, [state?.id]);

  // Filter messages whenever receiverId changes
  useEffect(() => {
    if (receiverId && messages.length > 0) {
      filterConversation(receiverId, messages);
    } else {
      setCurrentConversation([]);
    }
  }, [receiverId]);

  // Filter conversation between current user and selected recipient
  const filterConversation = (recipientId, allMessages) => {
    const filtered = allMessages.filter(
      (msg) => {
        // Add null checks for sender and recipient
        if (!msg.sender || !msg.recipient) return false;
        
        return (
          (msg.sender._id === state.id && msg.recipient._id === recipientId) || 
          (msg.sender._id === recipientId && msg.recipient._id === state.id)
        );
      }
    );
    setCurrentConversation(filtered);
  };

  const handleSend = async () => {
    if (!receiverId || !text.trim()) return;
    
    // Don't allow sending to admin
    const selectedUser = allUsers.find(user => user._id === receiverId);
    if (selectedUser && selectedUser.role === "admin") return;

    try {
      const newMessage = {
        sender: state.id,
        recipient: receiverId,
        content: text.trim(),
      };
      await sendMessage(newMessage);
      setText("");
      
      // Refresh messages and update current conversation
      const res = await getMessagesByUserId(state.id);
      setMessages(res.data);
      filterConversation(receiverId, res.data);
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
    }
  };

  // Get the name of currently selected recipient
  const getRecipientName = () => {
    if (!receiverId) return "";
    const recipient = allUsers.find(user => user._id === receiverId);
    return recipient ? `${recipient.name} ${recipient.surname}` : "";
  };

  // Check if selected recipient is an admin
  const isAdminSelected = () => {
    if (!receiverId) return false;
    const recipient = allUsers.find(user => user._id === receiverId);
    return recipient && recipient.role === "admin";
  };

  // Handle Enter key to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Separate users by role for better organization in the dropdown
  const adminUsers = allUsers.filter(user => 
    user._id !== state.id && user.role === "admin"
  );
  
  const teamUsers = allUsers.filter(user => 
    user._id !== state.id && 
    user.role !== "admin" && 
    user.team === state.team
  );

  return (
    <div className="msg-wrapper">
      <h3>📨 Mesajlaşma Paneli (Personel)</h3>

      <div className="msg-contacts">
        <h4>Kişiler</h4>
        <select
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          className="contact-select"
        >
          <option value="">Konuşmak istediğiniz kişiyi seçin</option>
          
          {/* Admin users group */}
          {adminUsers.length > 0 && (
            <optgroup label="Yöneticiler (Sadece Görüntüleme)">
              {adminUsers.map((user) => (
                <option 
                  key={user._id} 
                  value={user._id}
                  style={{fontWeight: 'bold'}}
                >
                  {user.name} {user.surname} ({user.role})
                </option>
              ))}
            </optgroup>
          )}
          
          {/* Team users group */}
          {teamUsers.length > 0 && (
            <optgroup label="Takım Üyeleri">
              {teamUsers.map((user) => (
                <option 
                  key={user._id} 
                  value={user._id}
                >
                  {user.name} {user.surname} ({user.role})
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {receiverId ? (
        <div className="msg-conversation">
          <div className="conversation-header">
            <h4>Sohbet: {getRecipientName()}</h4>
            {isAdminSelected() && (
              <div className="admin-message-notice">
                Admin mesajlarını görebilirsiniz ancak cevap veremezsiniz.
              </div>
            )}
          </div>
          
          <div className="conversation-messages">
            {currentConversation.length === 0 ? (
              <p className="no-messages">
                {isAdminSelected() 
                  ? "Bu admin ile mesaj geçmişi bulunmamaktadır." 
                  : "Henüz mesaj yok. Konuşmaya başlayın!"}
              </p>
            ) : (
              currentConversation.map((msg) => (
                <div 
                  key={msg._id} 
                  className={`msg-item ${msg.sender._id === state.id ? 'sent' : 'received'}`}
                >
                  <div className="msg-content">
                    <p>{msg.content}</p>
                  </div>
                  <div className="msg-timestamp">
                    <small>{new Date(msg.timestamp).toLocaleString()}</small>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="msg-input-area">
            <textarea
              placeholder={isAdminSelected() ? "Admin kullanıcısına mesaj gönderemezsiniz" : "Mesajınızı yazın..."}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="message-textarea"
              rows="3"
              disabled={isAdminSelected()}
            />
            <button 
              onClick={handleSend} 
              className="send-button" 
              disabled={isAdminSelected()}
            >
              <span>Gönder</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="select-contact-prompt">
          <p>Mesajlaşmak için yukarıdan bir kişi seçin.</p>
        </div>
      )}
    </div>
  );
}

export default PersonnelMessages;
