import { useState } from "react";
import { register } from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Register.css";

function Register() {
  const [user, setUser] = useState({
    name: "",
    surname: "",
    username: "", // Kullanıcı adı eklendi
    number: "",
    password: "",
    role: "personel", // Varsayılan olarak personel
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Numara alanının sayısal olup olmadığını kontrol et
    if (isNaN(user.number)) {
      toast.error("❌ Numara sadece sayısal olabilir!");
      return;
    }

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

        {/* Ad */}
        <input name="name" placeholder="Ad" onChange={handleChange} required />

        {/* Soyad */}
        <input name="surname" placeholder="Soyad" onChange={handleChange} required />

        {/* Kullanıcı Adı */}
        <input name="username" placeholder="Kullanıcı Adı" onChange={handleChange} required />

        {/* Numara (Sadece Sayısal) */}
        <input name="number" type="text" placeholder="Numara" onChange={handleChange} required />

        {/* Şifre Alanı */}
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

        {/* Kayıt Butonu */}
        <button type="submit">Kayıt Ol</button>

        {/* Giriş Yap Butonu */}
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
