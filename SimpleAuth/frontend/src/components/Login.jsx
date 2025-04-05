import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import "./Login.css";
import PasswordToggle from "./PasswordToggle.jsx";

function Login() {
  const [user, setUser] = useState({ username: "", password: "", role: "personel" });
  const navigate = useNavigate();

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(user);
      Cookies.set("token", response.data.token, { expires: 1, secure: true, sameSite: "Strict" });
      toast.success(`✅ ${response.data.message}`, { autoClose: 2000 });

      // Kullanıcı rolüne göre yönlendirme
      setTimeout(() => {
        navigate("/dashboard", { state: { role: response.data.role } });
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "❌ Giriş başarısız! Lütfen bilgilerinizi kontrol edin.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-box">
        <h1>Personel360</h1>
        
        {/* Rol Seçimi */}
        <div className="role-selection">
          <input
            type="radio"
            name="role"
            id="personel"
            value="personel"
            checked={user.role === "personel"}
            onChange={handleChange}
          />
          <label htmlFor="personel">Personel</label>

          <input
            type="radio"
            name="role"
            id="admin"
            value="admin"
            checked={user.role === "admin"}
            onChange={handleChange}
          />
          <label htmlFor="admin">Yönetici</label>
        </div>

        {/* Kullanıcı Adı Alanı */}
        <input name="username" placeholder="Kullanıcı Adı" onChange={handleChange} required />

        {/* Şifre Alanı ve Göz İkonu */}
        <div className="password-container">
          <PasswordToggle
            name="password"
            placeholder="Şifre"
            value={user.password}
            onChange={handleChange}
          />
        </div>

        {/* Giriş Butonu */}
        <button type="submit">Giriş Yap</button>

        {/* Kayıt Ol Butonu (Sadece Personel için gösterilecek) */}
        {user.role === "personel" && (
          <p className="register-link">
            Hesabınız yok mu?{" "}
            <span onClick={() => navigate("/register")} className="register-button">
              Kayıt Ol
            </span>
          </p>
        )}
      </form>
      
      <ToastContainer position="top-center" />
    </div>
  );
}

export default Login;