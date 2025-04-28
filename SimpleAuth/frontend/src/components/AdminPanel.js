import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FileShare from "./FileShare"; // Dosya paylaşımı bileşeni
import Messages from "./Messages"; // Mesajlaşma bileşeni
import "./AdminPanel.css";

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("personel");
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedTeamName, setSelectedTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

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

  // Takım personellerini getir
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

  const handleMenuClick = (menuItem) => {
  setActiveTab(menuItem);
  setSelectedMember(null); // 💥 Menü değişince sağ panel kapanır
};

const handleCollapseRightPanel = () => {
  setSelectedMember(null); // 💥 Daralt butonuna basınca sağ panel kapanır
};

  const renderContent = () => {
    if (activeTab === "personel") return <p>Personel yönetimi burada olacak.</p>;
    if (activeTab === "raporlar") return <p>Raporlar burada olacak.</p>;

    if (activeTab === "dosyaPaylasimi") {
      return <FileShare user={{ id: currentUserId, role: "admin" }} />;
    }

    if (activeTab === "mesajlar") {
      return <Messages user={{ id: currentUserId, role: "admin" }} />;
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
        <li onClick={() => handleMenuClick("takimlar")}>Takımlar</li>
        <li onClick={() => handleMenuClick("mesajlar")}>Mesaj Gönder</li>
        <li onClick={() => handleMenuClick("dosyaPaylasimi")}>Dosya Paylaşımı</li>
        <li onClick={() => handleMenuClick("personel")}>Personel</li>
        <li onClick={() => handleMenuClick("raporlar")}>Raporlar</li>
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
        <div className="panel-right-header">
          <h2>📄 Personel Detay</h2>
          <button
            className="collapse-button"
            onClick={handleCollapseRightPanel}
          >
            Kapat
          </button>
        </div>
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
