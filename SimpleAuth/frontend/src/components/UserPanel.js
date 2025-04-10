import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "./UserPanel.css";
import { updateUser } from "../api/api";

function UserPanel() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🧠 useMemo ile state sabitleniyor
  const userData = useMemo(() => location.state || {}, [location.state]);

  useEffect(() => {
    console.log("Gelen kullanıcı bilgisi:", userData);
    console.log("Güncelleme için ID:", userData.id);
  }, [userData]);

  const [activeTab, setActiveTab] = useState("gorevler");
  const [showEdit, setShowEdit] = useState(false);

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
        return <p>Burada görev listesi olacak.</p>;
      case "mesajlar":
        return <p>Burada mesajlar olacak.</p>;
      default:
        return <p>İçerik seçiniz.</p>;
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Oturumu kapatmak istediğinize emin misiniz?");
    if (confirmed) {
      navigate("/login");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const confirmed = window.confirm("Bilgileri güncellemek istediğinize emin misiniz?");
    if (!confirmed) return;

    try {
      console.log("Gönderilen ID:", userData.id);
      console.log("Gönderilen veri:", formData);
      await updateUser(userData.id, formData);
      alert("Bilgiler başarıyla güncellendi!");
      setShowEdit(false);
      window.location.reload();
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      alert("Güncelleme sırasında hata oluştu.");
    }
  };

  return (
    <div className="panel-wrapper">
      {/* Sol Menü */}
      <div className="panel-left">
        <h2>📁 MENÜ</h2>
        <ul>
          <li onClick={() => setActiveTab("gorevler")}>Görevler</li>
          <li onClick={() => setActiveTab("mesajlar")}>Mesajlar</li>
        </ul>
      </div>

      {/* Orta İçerik */}
      <div className="panel-center">
        <h2>📄 GÖREV TAKİBİ</h2>
        {renderContent()}
      </div>

      {/* Sağ Bilgi Paneli */}
      <div className="panel-right">
        <h2>👤 PERSONEL BİLGİLERİ</h2>
        <p><strong>Ad:</strong> {userData.name || "-"}</p>
        <p><strong>Soyad:</strong> {userData.surname || "-"}</p>
        <p><strong>Kullanıcı Adı:</strong> {userData.username || "-"}</p>
        <p><strong>Telefon:</strong> {userData.phone || "-"}</p>
        <p><strong>E-posta:</strong> {userData.email || "-"}</p>
        <p><strong>Doğum Tarihi:</strong> {userData.birthdate ? new Date(userData.birthdate).toLocaleDateString("tr-TR") : "-"}</p>
        <p><strong>Rol:</strong> {userData.role || "-"}</p>

        <button className="account-button" onClick={() => setShowEdit(true)}>Hesap Ayarları</button>
        <button onClick={handleLogout} className="logout-button">Oturumu Kapat</button>
      </div>

      {/* Güncelleme Formu */}
      {showEdit && (
        <div className="popup-backdrop">
          <div className="popup-form">
            <h3>Hesap Bilgilerini Güncelle</h3>
            <form onSubmit={handleUpdate}>
              <input type="text" name="name" placeholder="Ad" value={formData.name} onChange={handleChange} />
              <input type="text" name="surname" placeholder="Soyad" value={formData.surname} onChange={handleChange} />
              <input type="text" name="username" placeholder="Kullanıcı Adı" value={formData.username} onChange={handleChange} />
              <input type="text" name="phone" placeholder="Telefon" value={formData.phone} onChange={handleChange} />
              <input type="email" name="email" placeholder="E-posta" value={formData.email} onChange={handleChange} />
              <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} />
              <div className="popup-buttons">
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
