import { useState } from "react";
import { register } from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify"; // 📌 Toastify ekledik
import "react-toastify/dist/ReactToastify.css"; // 📌 Stil dosyası eklendi
import "./Register.css";

function Register() {
  const [user, setUser] = useState({ name: "", surname: "", number: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(user);
      toast.success("✅ Kayıt başarılı!", { autoClose: 2000 });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error("❌ Kayıt başarısız! Lütfen bilgilerinizi kontrol edin.");
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-box">
        <h2>Kayıt Ol</h2>
        <input name="name" placeholder="Ad" onChange={handleChange} required />
        <input name="surname" placeholder="Soyad" onChange={handleChange} required />
        <input name="number" placeholder="Numara" onChange={handleChange} required />

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

        <button type="submit">Kayıt Ol</button>

        {/* 📌 Giriş Yap Butonu */}
        <p className="login-link">
          Zaten hesabınız var mı?{" "}
          <span onClick={() => navigate("/login")} className="login-button">
            Giriş Yap
          </span>
        </p>
      </form>

      <ToastContainer position="top-center" />
    </div>
  );
}

export default Register;
