import { useState } from "react";
import { register } from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Register.css"; // Görselleştirme için CSS dosyası eklendi

function Register() {
  const [user, setUser] = useState({ name: "", surname: "", number: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(user);
      alert("Kayıt başarılı!");
      navigate("/login");
    } catch (error) {
      alert("Kayıt başarısız!");
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
      </form>
    </div>
  );
}

export default Register;
