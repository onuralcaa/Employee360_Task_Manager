import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Messages from "./Messages"; 
import "./TeamPanel.css";
import FileShareTeamLead from "./FileShare";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import MilestoneForm from "./MilestoneForm";
import TeamLeaderReports from "./TeamLeaderReports"; // Import the TeamLeaderReports component

function TeamPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("uyeler");
  const [teamMembers, setTeamMembers] = useState([]);
  const [userData, setUserData] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [rightPanelContent, setRightPanelContent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  // User bilgilerini localStorage'dan kontrol et
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setUserData(location.state);
  }, [location.state, navigate]);

  // Takım üyeleri çekiliyor
  useEffect(() => {
    if (userData?.team) {
      fetchTeamMembers();
      fetchTeamDetails();
    }
  }, [userData]);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/by-team/${userData.team}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTeamMembers(response.data);
    } catch (error) {
      console.error("Takım üyeleri alınamadı:", error);
    }
  };

  const fetchTeamDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/teams/${userData.team}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTeamName(response.data.name);
    } catch (error) {
      console.error("Takım bilgileri alınamadı:", error);
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

  const handleSelectMilestone = (milestone) => {
    // Milestone detayını göster
    setRightPanelContent(
      <div className="milestone-detail">
        <h3>{milestone.title}</h3>
        <p>{milestone.description}</p>
        <p><strong>Durum:</strong> {milestone.status}</p>
        <p><strong>Atanan:</strong> {milestone.assignedTo?.name || 'Atanmamış'}</p>
      </div>
    );
  };

  const handleAddMilestone = () => {
    // Yeni milestone ekleme formu
    setRightPanelContent(
      <div className="milestone-form">
        <h3>Yeni Kilometre Taşı</h3>
        <form>
          <div className="form-group">
            <label>Başlık</label>
            <input type="text" placeholder="Kilometre taşı başlığı"/>
          </div>
          <div className="form-group">
            <label>Açıklama</label>
            <textarea placeholder="Açıklama yazın"></textarea>
          </div>
          <div className="form-group">
            <label>Atanan Kişi</label>
            <select>
              <option value="">Seçiniz</option>
              {teamMembers.map(member => (
                <option key={member._id} value={member._id}>
                  {member.name} {member.surname}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-btn">İptal</button>
            <button type="submit" className="submit-btn">Oluştur</button>
          </div>
        </form>
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === "uyeler") {
      return (
        <div>
          <h3>📋 Takım Üyeleri</h3>
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

    if (activeTab === "mesajlar") {
      return <Messages user={userData} />; 
    }

    if (activeTab === "dosyaPaylasimi") {
      return <FileShareTeamLead user={userData} />; 
    }
    
    if (activeTab === "raporlar") {
      return <TeamLeaderReports user={userData} />;
    }

    if (activeTab === "gorevler") {
      return (
        <div>
          <TaskForm 
            user={userData} 
            onTaskCreated={() => {
              setActiveTab("gorevler");
              setShowTaskForm(false);
            }} 
            isVisible={showTaskForm}
          />
          <TaskList 
            user={userData}
            onSelectMilestone={handleSelectMilestone}
            activeTab="tasks"
            tasks={tasks}
            loading={loading}
            error={error}
            isTeamLeader={true}
            isMilestoneView={false}
            onAddMilestone={() => setShowTaskForm(!showTaskForm)}
            showTaskForm={showTaskForm}
          />
        </div>
      );
    }    if (activeTab === "milestonlar") {
      return (
        <div>
          <MilestoneForm isVisible={showMilestoneForm} />
          <TaskList 
            user={userData}
            onSelectMilestone={handleSelectMilestone}
            onAddMilestone={() => setShowMilestoneForm(!showMilestoneForm)}
            activeTab="milestones"
            setActiveTab={() => {}}
            milestones={milestones}
            loading={loading}
            error={error}
            isTeamLeader={true}
            isMilestoneView={true}
            showTaskForm={showMilestoneForm}
          />
        </div>
      );
    }

    return <p>Bir menü seçin.</p>;
  };

  return (
    <div className="panel-wrapper">
      <div className="panel-left">
        <h2>📁 MENÜ</h2>
        <ul>
          <li 
            onClick={() => setActiveTab("uyeler")} 
            className={activeTab === "uyeler" ? "active" : ""}
          >
            Takım Üyeleri
          </li>
          <li 
            onClick={() => setActiveTab("gorevler")} 
            className={activeTab === "gorevler" ? "active" : ""}
          >
            Görevler
          </li>
          <li 
            onClick={() => setActiveTab("milestonlar")} 
            className={activeTab === "milestonlar" ? "active" : ""}
          >
            Kilometre Taşları
          </li>
          <li 
            onClick={() => setActiveTab("mesajlar")} 
            className={activeTab === "mesajlar" ? "active" : ""}
          >
            Mesajlar
          </li>
          <li 
            onClick={() => setActiveTab("dosyaPaylasimi")} 
            className={activeTab === "dosyaPaylasimi" ? "active" : ""}
          >
            Dosya Paylaşımı
          </li>
          <li 
            onClick={() => setActiveTab("raporlar")} 
            className={activeTab === "raporlar" ? "active" : ""}
          >
            Raporlar
          </li>
        </ul>
      </div>

      <div className="team-lead-panel-center">
        <h2>📌 TAKIM LİDERİ PANELİ</h2>
        {renderContent()}
      </div>

      <div className="team-lead-panel-right">
        <div className="team-lead-info-box">
          <h2>👤 BİLGİLERİNİZ</h2>
          <p><strong>Ad Soyad:</strong> {userData?.name} {userData?.surname}</p>
          <p><strong>Rol:</strong> Takım Lideri</p>
          <p><strong>E-posta:</strong> {userData?.email}</p>
          <p><strong>Takım:</strong> {teamName || "Yükleniyor..."}</p>
        </div>

        <div className="team-lead-logout-container">
          <button className="team-lead-logout-button" onClick={handleLogout}>
            Oturumu Kapat
          </button>
        </div>
        {rightPanelContent}
      </div>
    </div>
  );
}

export default TeamPanel;
