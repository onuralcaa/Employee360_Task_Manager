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

  const handleNavigation = (path) => {
    if (user?.role === "admin" && path === "/personel") {
      alert("Yönetici olarak bu sayfaya erişemezsiniz.");
      return;
    }
    navigate(path);
  };

  if (user?.role === "admin") {
    return (
      <div className="dashboard-container">
        <div className="dashboard-box">
          <h1>Yönetici Girişi Başarılı! 👑</h1>
          <p>Yönetici olarak giriş yaptınız. Yönetim paneline erişebilirsiniz.</p>
          <button onClick={() => handleNavigation("/admin")} className="primary-button">
            Yönetim Paneline Git
          </button>
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt className="logout-icon" />
            Çıkış Yap
          </button>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h1>Personel Girişi Başarılı! 🎉</h1>
        <p>Başarıyla giriş yaptınız. Şimdi uygulamayı kullanabilirsiniz.</p>
        <button onClick={() => handleNavigation("/personel")} className="primary-button">
          Personel Sayfasına Git
        </button>
        <button onClick={handleLogout} className="logout-button">
          <FaSignOutAlt className="logout-icon" />
          Çıkış Yap
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Dashboard;