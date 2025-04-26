import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminPanel.css";
import Messages from "./Messages";

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("personel");
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedTeamName, setSelectedTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const navigate = useNavigate();

  // Giriş yapan kullanıcının ID'sini localStorage'dan çek (örnek)
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    if (storedId) setCurrentUserId(storedId);
  }, []);

  // Takımları getir
  useEffect(() => {
    if (activeTab === "takimlar") {
      axios.get("http://localhost:5000/api/teams")
        .then((res) => setTeams(res.data))
        .catch((err) => console.error("Takımlar alınamadı:", err));
    }
  }, [activeTab]);

  // Seçilen takımın personellerini getir
  useEffect(() => {
    if (selectedTeamId) {
      axios.get(`http://localhost:5000/api/users/by-team/${selectedTeamId}`)
        .then((res) => {
          setTeamMembers(res.data);
          setSelectedMember(null);
        })
        .catch((err) => console.error("Takım personelleri alınamadı:", err));

      const selectedTeam = teams.find((t) => t._id === selectedTeamId);
      setSelectedTeamName(selectedTeam?.name || "");
    }
  }, [selectedTeamId, teams]);

  const handleLogout = () => {
    if (window.confirm("Oturumu kapatmak istediğinize emin misiniz?")) {
      localStorage.clear();
      navigate("/login");
    }
  };

  const renderContent = () => {
    if (activeTab === "personel") return <p>Personel yönetimi burada olacak.</p>;
    if (activeTab === "raporlar") return <p>Raporlar burada olacak.</p>;

    
    if (activeTab === "mesajlar") {
      return <Messages user={{ id: currentUserId, role: "admin" }} />; // ✅ BU ŞEKİLDE OLMALI!
    }

    if (activeTab === "takimlar") {
      return (
        <div>
          <h3>📋 Takımlar</h3>
          {teams.map((team) => (
            <div
              key={team._id}
              onClick={() => setSelectedTeamId(team._id)}
              className="person-card"
              style={{ cursor: "pointer" }}
            >
              <p><strong>Takım Adı:</strong> {team.name}</p>
            </div>
          ))}

          {selectedTeamId && (
            <div style={{ marginTop: "20px" }}>
              <h4>👥 Takım Üyeleri – <span style={{ color: "#5b3f7a" }}>{selectedTeamName}</span></h4>
              {teamMembers.map((member) => (
                <div
                  key={member._id}
                  className="person-card"
                  onClick={() => setSelectedMember(member)}
                  style={{ cursor: "pointer" }}
                >
                  <p><strong>Ad:</strong> {member.name}</p>
                  <p><strong>Soyad:</strong> {member.surname}</p>
                  <p><strong>E-posta:</strong> {member.email}</p>
                </div>
              ))}
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
          <li onClick={() => setActiveTab("personel")}>Personel</li>
          <li onClick={() => setActiveTab("raporlar")}>Raporlar</li>
          <li onClick={() => setActiveTab("takimlar")}>Takımlar</li>
          <li onClick={() => setActiveTab("mesajlar")}>Mesajlar</li>
        </ul>
        <div className="logout-container" style={{ marginTop: "auto" }}>
          <button className="logout-button" onClick={handleLogout}>
            Oturumu Kapat
          </button>
        </div>
      </div>

      {/* Orta İçerik */}
      <div className="panel-center">
        <h2>📊 YÖNETİCİ PANELİ</h2>
        {renderContent()}
      </div>

      {/* Sağ Panel: Seçili Kişi Detay */}
      {selectedMember && (
        <div className="panel-right">
          <h2>📄 Personel Detay</h2>
          <div className="person-detail-card">
            <p><strong>Ad:</strong> {selectedMember.name || "-"}</p>
            <p><strong>Soyad:</strong> {selectedMember.surname || "-"}</p>
            <p><strong>Kullanıcı Adı:</strong> {selectedMember.username || "-"}</p>
            <p><strong>Numara:</strong> {selectedMember.number || "-"}</p>
            <p><strong>E-posta:</strong> {selectedMember.email || "-"}</p>
            <p><strong>Doğum Tarihi:</strong> {selectedMember.birthdate?.substring(0, 10) || "-"}</p>
            <p><strong>Rol:</strong> {selectedMember.role || "-"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
