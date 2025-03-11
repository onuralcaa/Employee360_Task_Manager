import { useState } from "react";
import { login } from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css"; // CSS dosyası yüklendi

function Login() {
  const [user, setUser] = useState({ number: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(user);
      alert("Giriş başarılı!");
      navigate("/dashboard");
    } catch (error) {
      alert("Giriş başarısız!");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-box">
        <h2>Giriş Yap</h2>

        {/* Numara Alanı */}
        <div className="input-container">
          <input
            name="number"
            placeholder="📞 Numara"
            onChange={handleChange}
            required
          />
        </div>

        {/* Şifre Alanı */}
        <div className="input-container password-container">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="🔑 Şifre"
            onChange={handleChange}
            required
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* Giriş Butonu */}
        <button type="submit">Giriş Yap</button>
      </form>
    </div>
  );
}

export default Login;
