import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // CSS dosyasını ekledik

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    alert("Çıkış yapıldı!");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h1>Hoş Geldiniz! 🎉</h1>
        <p>Başarıyla giriş yaptınız. Şimdi uygulamayı kullanabilirsiniz.</p>
        <button onClick={handleLogout}>Çıkış Yap</button>
      </div>
    </div>
  );
}

export default Dashboard;
