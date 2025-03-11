import { useState } from "react";
import { login } from "../api/api";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // CSS dosyasını ekledik
import { FaUserAlt, FaLock } from "react-icons/fa"; // İkonlar için react-icons kullanıyoruz

function Login() {
  const [user, setUser] = useState({ number: "", password: "" });
  const [error, setError] = useState(""); // Hata mesajı için state ekledik
  const navigate = useNavigate();

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(user);
      alert("Giriş başarılı!");
      navigate("/dashboard");
    } catch (error) {
      setError("Numara veya şifre hatalı!"); // Hata mesajını ekledik
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleSubmit}>
        <h2>Giriş Yap</h2>
        
        {error && <p className="error-message">{error}</p>} {/* Hata mesajı göstermek için */}

        <div className="input-container">
          <FaUserAlt className="icon" />
          <input name="number" placeholder="Numara" onChange={handleChange} required />
        </div>

        <div className="input-container">
          <FaLock className="icon" />
          <input name="password" type="password" placeholder="Şifre" onChange={handleChange} required />
        </div>

        <button className="login-btn" type="submit">Giriş Yap</button>
      </form>
    </div>
  );
}

export default Login;
