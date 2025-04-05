import { useNavigate, useLocation } from "react-router-dom";
import "./Dashboard.css";
import { FaSignOutAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Eğer rol bilgisi gelmediyse varsayılan olarak "personel" atanır
  const userRole = location.state?.role || "personel";
  const userName = location.state?.name || "Kullanıcı";

  const handleLogout = () => {
    toast.success("Çıkış yapıldı!", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
    });

    // Bildirim süresi kadar bekleyerek yönlendirme yapıyoruz
    setTimeout(() => {
      navigate("/login");
    }, 2500);
  };

  const handleLogin = () => {
    navigate("/personel"); // Navigates without passing state
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h1>
          {userRole === "admin" ? "Yönetici Girişi Başarılı! 👑" : "Personel Girişi Başarılı! 🎉"}
        </h1>
        <p>
          {userRole === "admin"
            ? "Yönetici olarak giriş yaptınız. Yönetim paneline erişebilirsiniz."
            : "Başarıyla giriş yaptınız. Şimdi uygulamayı kullanabilirsiniz."}
        </p>
        <button onClick={handleLogin}>
          Giriş Yap
        </button>
        <button onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          Çıkış Yap
        </button>
      </div>
      {/* 🚀 Toast bildirimlerinin çalışması için ekledik */}
      <ToastContainer />
    </div>
  );
}

export default Dashboard;