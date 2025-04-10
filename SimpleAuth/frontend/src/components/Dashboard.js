import { useNavigate, useLocation } from "react-router-dom";
import "./Dashboard.css";
import { FaSignOutAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = location.state?.role || "personel";
  const userName = location.state?.name || "Kullanıcı";
  const userSurname = location.state?.surname || "";

  const handleLogout = () => {
    toast.success("Çıkış yapıldı!", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
    });

    setTimeout(() => {
      navigate("/login");
    }, 2500);
  };

const goToPanel = () => {
  if (userRole === "admin") {
    navigate("/admin-panel");
  } else {
    navigate("/user-panel", {
      state: {
        id: location.state.id,  // ✅ Burası önemli
        role: userRole,
        name: userName,
        surname: userSurname,
        username: location.state.username,
        phone: location.state.phone,
        email: location.state.email,
        birthdate: location.state.birthdate,
      },
    });
  }
};



  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h1>
          {userRole === "admin"
            ? "Hoşgeldiniz Yönetici"
            : `Hoşgeldiniz ${userName} ${userSurname}`}
        </h1>
        <p>
          {userRole === "admin"
            ? "Yönetici olarak giriş yaptınız. Yönetim paneline erişebilirsiniz."
            : "Başarıyla giriş yaptınız. Şimdi uygulamayı kullanabilirsiniz."}
        </p>

        {userRole === "admin" ? (
          <button onClick={goToPanel}>Yönetici Paneline Git</button>
        ) : (
          <button onClick={goToPanel}>Kullanıcı Paneline Git</button>
        )}

        <button onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          Çıkış Yap
        </button>
      </div>

      <ToastContainer />
    </div>
  );
}

export default Dashboard;
