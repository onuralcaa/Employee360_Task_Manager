import { useState } from "react";
import { login } from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

function Login() {
  const [user, setUser] = useState({ number: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(user);
      toast.success("✅ Giriş başarılı!", { autoClose: 2000 });
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      toast.error("❌ Giriş başarısız! Lütfen bilgilerinizi kontrol edin.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-box">
        <h2>Giriş Yap</h2>

        {/* Numara Alanı */}
        <input name="number" placeholder="Numara" onChange={handleChange} required />

        {/* Şifre Alanı ve Göz İkonu */}
        <div className="password-container">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Şifre"
            onChange={handleChange}
            required
          />
          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* Giriş Butonu */}
        <button type="submit">Giriş Yap</button>

        {/* Kayıt Ol Butonu */}
        <p className="register-link">
          Hesabınız yok mu?{" "}
          <span onClick={() => navigate("/register")} className="register-button">
            Kayıt Ol
          </span>
        </p>
      </form>

      <ToastContainer position="top-center" />
    </div>
  );
}

export default Login;
