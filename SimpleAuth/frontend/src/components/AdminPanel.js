import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FileShare from "./FileShare"; // Dosya paylaşımı bileşeni
import Messages from "./Messages"; // Mesajlaşma bileşeni
import "./AdminPanel.css";
import { toggleUserStatus } from "../api/api"; // ✅ Aktif/Deaktif için


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

const handleToggleStatus = async () => {
  if (window.confirm(`Bu personeli ${selectedMember.isActive ? "devre dışı bırakmak" : "aktifleştirmek"} istediğinize emin misiniz?`)) {
    try {
      await toggleUserStatus(selectedMember._id);
      alert(`Personel ${selectedMember.isActive ? "devre dışı bırakıldı" : "aktifleştirildi"}.`);
      // Sağ paneli güncelle
      axios.get(`http://localhost:5000/api/users/by-team/${selectedTeamId}`)
        .then((res) => setTeamMembers(res.data))
        .catch((err) => console.error("Takım personelleri alınamadı:", err));
      setSelectedMember(null); // Sağ paneli kapat
    } catch (error) {
      console.error("Durum değiştirilirken hata:", error);
      alert("Durum değiştirilirken bir hata oluştu.");
    }
  }
};

const handleSelectMember = async (memberId) => {
  const response = await axios.get(`http://localhost:5000/api/users/${memberId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  setSelectedMember(response.data);
};


  const renderContent = () => {
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
          <h3>📋 Takımlar ve Personeller</h3>
          {teams.map((team) => (
            <div
              key={team._id}
              onClick={() => setSelectedTeamId(team._id)}
              className={`person-card ${selectedTeamId === team._id ? "selected-team" : ""}`}
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
                  className={`person-card ${selectedMember?._id === member._id ? "selected-member" : ""}`}
                  onClick={() => handleSelectMember(member._id)} // 🟢 Burayı değiştirdik!
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
        <li onClick={() => handleMenuClick("takimlar")}>Takımlar ve Personeller</li>
        <li onClick={() => handleMenuClick("mesajlar")}>Mesaj Gönder</li>
        <li onClick={() => handleMenuClick("dosyaPaylasimi")}>Dosya Paylaşımı</li>
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
      <div>
        <button className="collapse-button" onClick={handleCollapseRightPanel}>
          Kapat
        </button>
        <button className="delete-button" onClick={handleDeleteMember}>
          Personeli Sil
        </button>
        <button
          className={`status-toggle-button ${selectedMember.isActive ? "active" : ""}`}
          onClick={handleToggleStatus}
        >
          {selectedMember.isActive ? "Devre Dışı Bırak" : "Aktifleştir"}
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
          <p><strong>Rol:</strong> {selectedMember.role || "-"}</p>
          <p><strong>Durum:</strong> {selectedMember.isActive ? "Aktif" : "Devre Dışı"}</p>
          <p><strong>Kayıt Tarihi:</strong> {new Date(selectedMember.createdAt).toLocaleString() || "-"}</p>
          <p><strong>Son Giriş:</strong> {selectedMember.lastLogin ? new Date(selectedMember.lastLogin).toLocaleString() : "-"}</p> 
        </div>
      </div>
    )}
  </div>
);
}

export default AdminPanel;
