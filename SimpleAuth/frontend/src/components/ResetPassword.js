import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "./ResetPassword.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("❌ Şifreler uyuşmuyor!");
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/users/reset-password/${token}`, {
  password,
});

      toast.success("✅ Şifre başarıyla güncellendi!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "❌ Şifre güncelleme başarısız!");
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleReset}>
        <h2>Yeni Şifre Oluştur</h2>

        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Yeni Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="password-container">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Yeni Şifre (Tekrar)"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit">Şifreyi Güncelle</button>
      </form>
      <ToastContainer position="top-center" />
    </div>
  );
}

export default ResetPassword;
