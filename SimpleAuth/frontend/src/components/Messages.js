import { useEffect, useState } from "react";
import {
  getMessagesByUserId,
  sendMessage,
  getAllUsers,
} from "../api/api";
import "./Messages.css";

function Messages({ user }) {
  const state = user;

  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [text, setText] = useState("");
  
  // State to track currently selected conversation
  const [currentConversation, setCurrentConversation] = useState([]);

  useEffect(() => {
    console.log("👤 Aktif kullanıcı:", state);
    console.log("📋 Tüm kullanıcılar:", allUsers);

    if (!state?.id) return;

    getMessagesByUserId(state.id)
      .then((res) => {
        setMessages(res.data);
        // If a recipient is selected, filter conversations immediately
        if (receiverId) {
          filterConversation(receiverId, res.data);
        }
      })
      .catch((err) => console.error("Mesajlar alınamadı", err));

    getAllUsers()
      .then((res) => {
        console.log("✅ Backend'den gelen kullanıcı listesi:", res.data);
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
    
    // Don't allow regular users to send messages to admins
    if (isAdminSelected()) return;

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
  };  // Filter the list of users that this user can message
  const filteredRecipients = allUsers.filter((user) => {
    // Don't show the current user in the list
    if (user._id === state.id) return false;

    // Admin can message anyone
    if (state.role === "admin") return true;

    // Team leaders can message admin, other team leaders, and their team members
    if (state.role === "team_leader") {
      return (
        user.role === "admin" ||
        user.role === "team_leader" ||
        user.team === state.team
      );
    }

    // Regular personnel can see admins (to view messages) and can message team members and team leaders
    if (state.role === "personel") {
      return (
        user.role === "admin" || // Include admins for viewing
        (user.team === state.team &&
          (user.role === "personel" || user.role === "team_leader"))
      );
    }

    return false;
  });
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
    return recipient && recipient.role === "admin" && state.role === "personel";
  };

  // Handle Enter key to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="msg-wrapper">
      <h3>📨 Mesajlaşma Paneli</h3>      <div className="msg-contacts">
        <h4>Kişiler</h4>
        {state.role === "personel" && (
          <div className="messaging-info">
            <small>Not: Personel, admin mesajlarını görebilir ancak cevap veremez</small>
          </div>
        )}
        <select
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          className="contact-select"
        >
          <option value="">Konuşmak istediğiniz kişiyi seçin</option>
          {filteredRecipients.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} {user.surname} ({user.role})
            </option>
          ))}
        </select>
      </div>

      {receiverId ? (        <div className="msg-conversation">
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

export default Messages;
