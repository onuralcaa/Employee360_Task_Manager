import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./common/LoadingSpinner";
import { useNavigate } from 'react-router-dom';
import "./PersonelPage.css";

function PersonelPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  if (loading) {
    return <LoadingSpinner message="Personel bilgileri yükleniyor..." />;
  }
  
  const userName = user ? user.name : "Kullanıcı";

  return (
    <div className="personel-page-container">
      <div className="personel-card">
        <h1>Hoşgeldiniz, {userName}!</h1>
        <div className="personel-info">
          <p><strong>Kullanıcı Adı:</strong> {user?.username}</p>
          <p><strong>Rol:</strong> {user?.role === "admin" ? "Yönetici" : "Personel"}</p>
        </div>
      </div>
    </div>
  );
}

export default PersonelPage;