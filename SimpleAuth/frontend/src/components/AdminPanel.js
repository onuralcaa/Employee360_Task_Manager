import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser, getAllTeams, getUsersByTeam } from "../api/api";
import axios from "axios"; // Add axios import
import FileShare from "./FileShare"; 
import Messages from "./Messages"; 
import TaskList from './TaskList';
import MilestoneAdmin from './MilestoneAdmin'; // Import the MilestoneAdmin component
import "./AdminPanel.css";

function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("takimlar");
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedTeamName, setSelectedTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [rightPanelContent, setRightPanelContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get user data from location state or fetch from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // First try to get data from navigation state
        if (location.state && (location.state.id || location.state._id)) {
          setCurrentUser({
            ...location.state,
            id: location.state.id || location.state._id,
            _id: location.state._id || location.state.id
          });
          setLoading(false);
          return;
        }

        // If no state, try to get from localStorage and API
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        
        if (!token || !userId) {
          navigate("/login");
          return;
        }

        const response = await getUser(userId);
        
        if (!response || !response.data) {
          throw new Error("Failed to load user data");
        }
        
        if (response.data.role !== "admin") {
          console.error("Unauthorized access: Not an admin");
          navigate("/login");
          return;
        }
        
        setCurrentUser({
          ...response.data,
          id: response.data._id || response.data.id,
          _id: response.data._id || response.data.id
        });
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError("Failed to load user data. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, location]);

  // Fetch teams data
  useEffect(() => {
    if (activeTab === "takimlar" && currentUser) {
      const fetchTeams = async () => {
        try {
          const response = await getAllTeams();
          
          if (!response || !response.data) {
            throw new Error("Failed to load teams data");
          }
          
          setTeams(response.data);
        } catch (err) {
          console.error("Failed to fetch teams:", err);
          setError("Failed to load teams data.");
        }
      };
      
      fetchTeams();
    }
  }, [activeTab, currentUser]);

  // Fetch team members when a team is selected
  useEffect(() => {
    if (selectedTeamId && currentUser) {
      const fetchTeamMembers = async () => {
        try {
          const response = await getUsersByTeam(selectedTeamId);
          
          if (!response || !response.data) {
            throw new Error("Failed to load team members");
          }
          
          setTeamMembers(response.data);
          // Clear selected member when team changes
          setSelectedMember(null);
          
          // Set team name
          const selectedTeam = teams.find(t => t._id === selectedTeamId);
          setSelectedTeamName(selectedTeam?.name || "");
        } catch (err) {
          console.error("Failed to fetch team members:", err);
          setError("Failed to load team members.");
        }
      };
      
      fetchTeamMembers();
    }
  }, [selectedTeamId, teams, currentUser]);

  const handleLogout = () => {
    if (window.confirm("Oturumu kapatmak istediğinize emin misiniz?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/login");
    }
  };

  const handleMenuClick = (menuItem) => {
    setActiveTab(menuItem);
    setSelectedMember(null);
    setRightPanelContent(null);
  };

  const handleCollapseRightPanel = () => {
    setSelectedMember(null);
  };

  const handleSelectMilestone = (milestone) => {
    setRightPanelContent(
      <div className="milestone-detail">
        <h3>{milestone.title}</h3>
        <p>{milestone.description}</p>
        <p><strong>Durum:</strong> {milestone.status}</p>
        <p><strong>Atanan:</strong> {milestone.assignedTo?.name || 'Atanmamış'}</p>
        <p><strong>Takım:</strong> {milestone.team?.name || '-'}</p>
        {milestone.createdBy && (
          <p><strong>Oluşturan:</strong> {milestone.createdBy?.name || '-'}</p>
        )}
      </div>
    );
  };

  const handleAddMilestone = () => {
    setRightPanelContent(
      <div className="milestone-form">
        <h3>Yeni Görev</h3>
        <form>
          <div className="form-group">
            <label>Başlık</label>
            <input type="text" placeholder="Görev başlığı"/>
          </div>
          <div className="form-group">
            <label>Açıklama</label>
            <textarea placeholder="Açıklama yazın"></textarea>
          </div>
          <div className="form-group">
            <label>Takım</label>
            <select>
              <option value="">Takım Seçin</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Atanan Kişi</label>
            <select>
              <option value="">Personel Seçin</option>
              {teamMembers.map(member => (
                <option key={member._id} value={member._id}>
                  {member.name} {member.surname}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setRightPanelContent(null)}>İptal</button>
            <button type="submit" className="submit-btn">Oluştur</button>
          </div>
        </form>
      </div>
    );
  };

  // Add the handleDeleteMember function
  const handleDeleteMember = async () => {
    if (window.confirm("Bu personeli silmek istediğinize emin misiniz?")) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${selectedMember._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        alert("Personel başarıyla silindi.");
        setSelectedMember(null); // Sağ paneli kapat
        // Takım üyelerini güncelle:
        axios.get(`http://localhost:5000/api/users/by-team/${selectedTeamId}`)
          .then((res) => setTeamMembers(res.data))
          .catch((err) => console.error("Takım personelleri alınamadı:", err));
      } catch (error) {
        console.error("Personel silinirken hata:", error);
        alert("Personel silinirken bir hata oluştu.");
      }
    }
  };

  // Render appropriate content based on the active tab
  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      );
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    if (!currentUser) {
      return <div className="error-message">Kullanıcı bilgileri yüklenemedi.</div>;
    }

    if (activeTab === "raporlar") return <p>Raporlar burada olacak.</p>;

    if (activeTab === "dosyaPaylasimi") {
      return <FileShare user={currentUser} />;
    }

    if (activeTab === "mesajlar") {
      return <Messages user={currentUser} />;
    }

    if (activeTab === "gorevler") {
      return (
        <TaskList 
          user={currentUser}
          onSelectMilestone={handleSelectMilestone}
          onAddMilestone={handleAddMilestone}
          isAdmin={true}
          isMilestoneView={false} // Explicitly set to false to ensure only tasks are displayed
        />
      );
    }

    if (activeTab === "milestones") {
      return <MilestoneAdmin user={currentUser} />;
    }

    if (activeTab === "takimlar") {
      return (
        <div>
          <h3>📋 Takımlar ve Personeller</h3>
          {teams.length === 0 ? (
            <p>Henüz takım bulunmuyor.</p>
          ) : (
            teams.map((team) => (
              <div
                key={team._id}
                onClick={() => setSelectedTeamId(team._id)}
                className={`person-card ${selectedTeamId === team._id ? 'selected' : ''}`}
              >
                <p><strong>Takım Adı:</strong> {team.name}</p>
              </div>
            ))
          )}

          {selectedTeamId && (
            <div style={{ marginTop: "20px" }}>
              <h4>👥 Takım Üyeleri – <span style={{ color: "#5b3f7a" }}>{selectedTeamName}</span></h4>
              {teamMembers.length === 0 ? (
                <p>Bu takımda henüz üye bulunmuyor.</p>
              ) : (
                teamMembers.map((member) => (
                  <div
                    key={member._id}
                    className={`person-card ${selectedMember?._id === member._id ? 'selected' : ''}`}
                    onClick={() => setSelectedMember(member)}
                  >
                    <p><strong>Ad:</strong> {member.name}</p>
                    <p><strong>Soyad:</strong> {member.surname}</p>
                    <p><strong>E-posta:</strong> {member.email}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      );
    }

    return <p>Bir menü seçin.</p>;
  };

  return (
    <div className="panel-wrapper">
      {/* Sol Menü */}
      <div className="panel-left">
        <h2>📁 MENÜ</h2>
        <ul>
          <li 
            onClick={() => handleMenuClick("takimlar")}
            className={activeTab === "takimlar" ? "active" : ""}
          >
            Takımlar ve Personeller
          </li>
          <li 
            onClick={() => handleMenuClick("gorevler")}
            className={activeTab === "gorevler" ? "active" : ""}
          >
            Görevler
          </li>
          <li 
            onClick={() => handleMenuClick("milestones")}
            className={activeTab === "milestones" ? "active" : ""}
          >
            Kilometre Taşları
          </li>
          <li 
            onClick={() => handleMenuClick("mesajlar")}
            className={activeTab === "mesajlar" ? "active" : ""}
          >
            Mesaj Gönder
          </li>
          <li 
            onClick={() => handleMenuClick("dosyaPaylasimi")}
            className={activeTab === "dosyaPaylasimi" ? "active" : ""}
          >
            Dosya Paylaşımı
          </li>
          <li 
            onClick={() => handleMenuClick("raporlar")}
            className={activeTab === "raporlar" ? "active" : ""}
          >
            Raporlar
          </li>
        </ul>
        <div className="logout-container">
          <button className="logout-button" onClick={handleLogout}>
            Oturumu Kapat
          </button>
        </div>
      </div>

      {/* Orta İçerik */}
      <div className="panel-center">
        <h2>📊 YÖNETİCİ PANELİ {currentUser && `- ${currentUser.name} ${currentUser.surname}`}</h2>
        {renderContent()}
      </div>

      {/* Sağ Panel: Seçili Kişi Detay */}
      {selectedMember && (
        <div className="panel-right">
          <div className="panel-right-header">
            <h2>📄 Personel Detay</h2>
            <div>
            <button
              className="collapse-button"
              onClick={handleCollapseRightPanel}
            >
              Kapat
            </button>
            </div>
          </div>
              
          <div className="person-detail-card">
            <p><strong>Ad:</strong> {selectedMember.name || "-"}</p>
            <p><strong>Soyad:</strong> {selectedMember.surname || "-"}</p>
            <p><strong>Kullanıcı Adı:</strong> {selectedMember.username || "-"}</p>
            <p><strong>Numara:</strong> {selectedMember.number || "-"}</p>
            <p><strong>E-posta:</strong> {selectedMember.email || "-"}</p>
            <p><strong>Doğum Tarihi:</strong> {selectedMember.birthdate?.substring(0, 10) || "-"}</p>
            <p><strong>Rol:</strong> {selectedMember.role === "admin" ? "Yönetici" : 
                                     selectedMember.role === "team_leader" ? "Takım Lideri" : "Personel"}</p>
            
            {/* Add Delete Button */}
            <button 
              className="delete-button" 
              onClick={handleDeleteMember}
              style={{ 
                backgroundColor: "#ff4d4d", 
                color: "white", 
                padding: "8px 12px", 
                border: "none", 
                borderRadius: "4px", 
                cursor: "pointer",
                marginTop: "15px"
              }}
            >
              Personeli Sil
            </button>
          </div>
        </div>
      )}

      {/* Sağ Panel: Dinamik İçerik */}
      {!selectedMember && rightPanelContent && (
        <div className="panel-right">
          <div className="panel-right-header">
            <h2>📄 Detay</h2>
            <button
              className="collapse-button"
              onClick={() => setRightPanelContent(null)}
            >
              Kapat
            </button>
          </div>
          {rightPanelContent}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
