import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";
import PasswordToggle from "./PasswordToggle.jsx";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./common/LoadingSpinner";

function Login() {
  const [user, setUser] = useState({ username: "", password: "", role: "personel" });
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(user);
  };

  if (loading) {
    return <LoadingSpinner message="Giriş yapılıyor..." />;
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-box">
        <h1>Employee360</h1>
        
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
        <input 
          name="username" 
          placeholder="Kullanıcı Adı" 
          onChange={handleChange} 
          required 
        />

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