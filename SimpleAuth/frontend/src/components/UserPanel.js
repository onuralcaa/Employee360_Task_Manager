import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "./UserPanel.css";
import { updateUser } from "../api/api";
import PersonnelMessages from "./Messages";
import TaskList from "./TaskList";
import FileShare from "./FileShare";

function UserPanel() {
  const location = useLocation();
  const navigate = useNavigate();

  const userData = useMemo(() => location.state || {}, [location.state]);

  useEffect(() => {
    if (!userData.id) {
      navigate("/login");
    }
  }, [userData, navigate]);

  const [activeTab, setActiveTab] = useState("mesajlar");
  const [showEdit, setShowEdit] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: userData.name || "",
    surname: userData.surname || "",
    username: userData.username || "",
    phone: userData.phone || "",
    email: userData.email || "",
    birthdate: userData.birthdate ? userData.birthdate.slice(0, 10) : "",
  });

const renderContent = () => {
  switch (activeTab) {
    case "gorevler":
      return (
        <TaskList 
          user={userData}
          activeTab="tasks"
          tasks={tasks}
          loading={loading}
          error={error}
          isTeamLeader={false}
          isMilestoneView={false}
        />
      );
    case "milestonlar":
      return (
        <TaskList 
          user={userData}
          activeTab="milestones"
          milestones={milestones}
          loading={loading}
          error={error}
          isTeamLeader={false}
          isMilestoneView={true}
        />
      );
    case "mesajlar":
      return <PersonnelMessages user={userData} />;
    case "dosyalar":
      return <FileShare user={userData} />;
    default:
      return <p>İçerik seçiniz.</p>;
  }
};


  const handleLogout = () => {
    const confirmed = window.confirm("Oturumu kapatmak istediğinize emin misiniz?");
    if (confirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/login");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!window.confirm("Bilgileri güncellemek istediğinize emin misiniz?")) return;

    try {
      await updateUser(userData.id, formData);
      alert("Bilgiler başarıyla güncellendi!");
      setShowEdit(false);
      window.location.reload();
    } catch (error) {
      alert("Güncelleme sırasında hata oluştu.");
    }
  };

  // Check if a user is a team leader or admin (has access to milestones)
  const hasMilestoneAccess = userData.role === "team_leader" || userData.role === "admin";

  return (
    <div className="user-panel-wrapper">
      {/* Sol Menü */}
      <div className="user-panel-left">
        <h2>📁 MENÜ</h2>
        <ul>
          <li 
            className={activeTab === "mesajlar" ? "active" : ""}
            onClick={() => setActiveTab("mesajlar")}
          >
            Mesajlar
          </li>
          <li 
            className={activeTab === "gorevler" ? "active" : ""}
            onClick={() => setActiveTab("gorevler")}
          >
            Görevler
          </li>
          <li 
            className={activeTab === "dosyalar" ? "active" : ""}
            onClick={() => setActiveTab("dosyalar")}
          >
            Dosyalar
          </li>
          {/* Only show Milestones tab to team leaders and admins */}
          {hasMilestoneAccess && (
            <li 
              className={activeTab === "milestonlar" ? "active" : ""}
              onClick={() => setActiveTab("milestonlar")}
            >
              Kilometre Taşları
            </li>
          )}
        </ul>
      </div>

      {/* Orta İçerik */}
      <div className="user-panel-center">
        <h2>📄 PERSONEL PANELİ</h2>
        {renderContent()}
      </div>

      {/* Sağ Panel */}
      <div className="user-panel-right">
        <h2>👤 PERSONEL BİLGİLERİ</h2>
        <p><strong>Ad:</strong> {userData.name || "-"}</p>
        <p><strong>Soyad:</strong> {userData.surname || "-"}</p>
        <p><strong>Kullanıcı Adı:</strong> {userData.username || "-"}</p>
        <p><strong>Telefon:</strong> {userData.phone || "-"}</p>
        <p><strong>E-posta:</strong> {userData.email || "-"}</p>
        <p><strong>Doğum Tarihi:</strong> {userData.birthdate ? new Date(userData.birthdate).toLocaleDateString("tr-TR") : "-"}</p>
        <p><strong>Rol:</strong> {userData.role || "-"}</p>

        <button className="user-account-button" onClick={() => setShowEdit(true)}>Hesap Ayarları</button>
        <button className="user-logout-button" onClick={handleLogout}>Oturumu Kapat</button>
      </div>

      {/* Güncelleme Formu */}
      {showEdit && (
        <div className="user-popup-backdrop">
          <div className="user-popup-form">
            <h3>Hesap Bilgilerini Güncelle</h3>
            <form onSubmit={handleUpdate}>
              <input type="text" name="name" placeholder="Ad" value={formData.name} onChange={handleChange} />
              <input type="text" name="surname" placeholder="Soyad" value={formData.surname} onChange={handleChange} />
              <input type="text" name="username" placeholder="Kullanıcı Adı" value={formData.username} onChange={handleChange} />
              <input type="text" name="phone" placeholder="Telefon" value={formData.phone} onChange={handleChange} />
              <input type="email" name="email" placeholder="E-posta" value={formData.email} onChange={handleChange} />
              <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} />
              <div className="user-popup-buttons">
                <button type="submit">Güncelle</button>
                <button type="button" onClick={() => setShowEdit(false)}>İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserPanel;
