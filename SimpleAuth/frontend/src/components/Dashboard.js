import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { FaSignOutAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Dashboard() {
  const navigate = useNavigate();

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

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h1>Hoş Geldiniz! 🎉</h1>
        <p>Başarıyla giriş yaptınız. Şimdi uygulamayı kullanabilirsiniz.</p>
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
