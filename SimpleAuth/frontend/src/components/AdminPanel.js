import { useEffect, useState } from "react";
import { getAllPersonnel } from "../api/api";
import "./AdminPanel.css";

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("personel");
  const [personnelList, setPersonnelList] = useState([]);

  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        const response = await getAllPersonnel();
        setPersonnelList(response.data);
      } catch (error) {
        console.error("Personel verisi alınamadı:", error);
      }
    };

    fetchPersonnel();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "personel":
        return <p>Personel yönetimi burada olacak.</p>;
      case "raporlar":
        return <p>Raporlar burada olacak.</p>;
      default:
        return <p>Bir menü seçin.</p>;
    }
  };

  return (
    <div className="panel-wrapper">
      {/* Sol Menü */}
      <div className="panel-left">
        <h2>📁 MENÜ</h2>
        <ul>
          <li onClick={() => setActiveTab("personel")}>Personel</li>
          <li onClick={() => setActiveTab("raporlar")}>Raporlar</li>
        </ul>
      </div>

      {/* Orta İçerik */}
      <div className="panel-center">
        <h2>📊 YÖNETİCİ PANELİ</h2>
        {renderContent()}
      </div>

      {/* Sağ Bilgi Paneli */}
      <div className="panel-right">
        <h2>👥 PERSONEL LİSTESİ</h2>
        {personnelList.map((person) => (
          <div key={person._id} className="person-card">
            <p><strong>ID:</strong> {person._id}</p>
            <p><strong>Ad:</strong> {person.name}</p>
            <p><strong>Soyad:</strong> {person.surname}</p>
            <p><strong>E-posta:</strong> {person.email}</p>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPanel;
