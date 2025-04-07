import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { FaSignOutAlt } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./common/LoadingSpinner";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  // If still loading, show loading spinner
  if (loading) {
    return <LoadingSpinner message="Yükleniyor..." />;
  }

  const handleLogout = () => {
    logout();
  };

  const handleLogin = () => {
    navigate("/personel"); // Navigates to the personel page
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h1>
          {user?.role === "admin" ? "Yönetici Girişi Başarılı! 👑" : "Personel Girişi Başarılı! 🎉"}
        </h1>
        <p>
          {user?.role === "admin"
            ? "Yönetici olarak giriş yaptınız. Yönetim paneline erişebilirsiniz."
            : "Başarıyla giriş yaptınız. Şimdi uygulamayı kullanabilirsiniz."}
        </p>
        <button onClick={handleLogin} className="primary-button">
          Personel Sayfasına Git
        </button>
        <button onClick={handleLogout} className="logout-button">
          <FaSignOutAlt className="logout-icon" />
          Çıkış Yap
        </button>
      </div>
      {/* Toast bildirimlerinin çalışması için ekledik */}
      <ToastContainer />
    </div>
  );
}

export default Dashboard;