import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div>
      <h1>Hoş Geldiniz!</h1>
      <button onClick={handleLogout}>Çıkış Yap</button>
    </div>
  );
}

export default Dashboard;
