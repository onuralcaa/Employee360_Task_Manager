import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./TeamPanel.css"; // ✅ Yeni dosya

function TeamPanel() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("uyeler");
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);

  // Takım adını çek
  useEffect(() => {
    if (state?.team) {
      axios
        .get(`http://localhost:5000/api/teams/${state.team}`)
        .then((res) => setTeamName(res.data.name))
        .catch((err) => console.error("Takım adı alınamadı:", err));
    }
  }, [state?.team]);

  // Takım üyelerini çek
  useEffect(() => {
    if (state?.team) {
      axios
        .get(`http://localhost:5000/api/users/by-team/${state.team}`)
        .then((res) => setTeamMembers(res.data))
        .catch((err) => console.error("Takım üyeleri alınamadı:", err));
    }
  }, [state?.team]);

  const handleLogout = () => {
    const confirmed = window.confirm("Oturumu kapatmak istediğinize emin misiniz?");
    if (confirmed) {
      navigate("/login");
    }
  };

  const renderContent = () => {
    if (activeTab === "uyeler") {
      return (
        <div>
          <h3>👥 Takım Üyeleri</h3>
          {teamMembers.map((member) => (
            <div key={member._id} className="team-lead-person-card">
              <p><strong>Ad:</strong> {member.name}</p>
              <p><strong>Soyad:</strong> {member.surname}</p>
              <p><strong>E-posta:</strong> {member.email}</p>
            </div>
          ))}
        </div>
      );
    }

    return <p>Bir menü seçin.</p>;
  };

  return (
    <div className="team-lead-panel-wrapper">
      {/* Sol Menü */}
      <div className="team-lead-panel-left">
        <h2>📁 MENÜ</h2>
        <ul>
          <li onClick={() => setActiveTab("uyeler")}>Takım Üyeleri</li>
        </ul>
      </div>

      {/* Orta İçerik */}
      <div className="team-lead-panel-center">
        <h2>📌 TAKIM LİDERİ PANELİ</h2>
        {renderContent()}
      </div>

      {/* Sağ Bilgi Paneli */}
      <div className="team-lead-panel-right">
        <div className="team-lead-info-box">
          <h2>👤 BİLGİLERİNİZ</h2>
          <p><strong>Ad Soyad:</strong> {state?.name} {state?.surname}</p>
          <p><strong>Takım:</strong> {teamName || "Yükleniyor..."}</p>
        </div>

        <div className="team-lead-logout-container">
          <button className="team-lead-logout-button" onClick={handleLogout}>
            Oturumu Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeamPanel;
