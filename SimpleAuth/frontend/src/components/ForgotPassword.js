import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // 🔹 Navigasyon için
import "react-toastify/dist/ReactToastify.css";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate(); // 🔹 Hook kullanımı

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/users/forgot-password", { email });
      toast.success("📧 Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
    } catch (error) {
      const errMsg = error.response?.data?.message || "Bir hata oluştu.";
      toast.error("❌ " + errMsg);
    }
  };

return (
  <div className="forgot-container">
    <form className="forgot-box" onSubmit={handleSubmit}>
      <h2>Şifremi Unuttum</h2>
      <input
        type="email"
        placeholder="Kayıtlı E-posta Adresi"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Bağlantı Gönder</button>

      {/* Girişe Dön butonu formun içinde ve ortalanmış */}
      <div className="back-to-login">
        <span onClick={() => navigate("/login")}>← Giriş Sayfasına Dön</span>
      </div>
    </form>

    <ToastContainer position="top-center" />
  </div>
);

}

export default ForgotPassword;
