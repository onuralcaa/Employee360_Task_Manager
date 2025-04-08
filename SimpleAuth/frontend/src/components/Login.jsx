import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";
import PasswordToggle from "./PasswordToggle.jsx";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./common/LoadingSpinner";

function Login() {
  const [user, setUser] = useState({ username: "", password: "", role: "personel" });
  const [errors, setErrors] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const { login, loading, isAuthenticated } = useAuth();

  if (isAuthenticated()) {
    navigate('/dashboard');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    
    // Clear error when field changes
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { username: "", password: "" };

    // Validate username
    if (!user.username.trim()) {
      newErrors.username = "Kullanıcı adı gereklidir";
      isValid = false;
    }

    // Validate password
    if (!user.password.trim()) {
      newErrors.password = "Şifre gereklidir";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const result = await login(user);
    
    if (!result.success) {
      // If login failed, set appropriate field errors
      if (result.message.toLowerCase().includes('kullanıcı') || 
          result.message.toLowerCase().includes('user') ||
          result.message.toLowerCase().includes('bulunamadı') ||
          result.message.toLowerCase().includes('not found')) {
        setErrors(prev => ({ ...prev, username: "Geçersiz kullanıcı adı" }));
      } else if (result.message.toLowerCase().includes('şifre') || 
                result.message.toLowerCase().includes('credentials') ||
                result.message.toLowerCase().includes('password')) {
        setErrors(prev => ({ ...prev, password: "Geçersiz şifre" }));
      }
    }
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
        <div className="input-group">
          <input 
            name="username" 
            placeholder="Kullanıcı Adı" 
            onChange={handleChange} 
            className={errors.username ? "error" : ""}
            required 
          />
          {errors.username && <div className="error-message">{errors.username}</div>}
        </div>

        {/* Şifre Alanı ve Göz İkonu */}
        <div className="input-group">
          <div className="password-container">
            <PasswordToggle
              name="password"
              placeholder="Şifre"
              value={user.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
            />
          </div>
          {errors.password && <div className="error-message">{errors.password}</div>}
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