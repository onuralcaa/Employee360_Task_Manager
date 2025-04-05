import { useState } from "react";
import { register } from "../api/api";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Register.css";
import PasswordToggle from "./PasswordToggle.jsx";

function Register() {
  const [user, setUser] = useState({
    name: "",
    surname: "",
    username: "",
    number: "",
    email: "",
    birthdate: "",
    password: "",
    role: "personel",
  });

  const [confirmPassword, setConfirmPassword] = useState(""); // 📌 Şifre tekrar
  const navigate = useNavigate();

  // Add a function to validate password strength
  function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar
    );
  }

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(user.password)) {
      toast.error("❌ Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character.");
      return;
    }

    if (isNaN(user.number)) {
      toast.error("❌ Numara sadece sayısal olabilir!");
      return;
    }

    if (user.password !== confirmPassword) {
      toast.error("❌ Şifreler uyuşmuyor!");
      return;
    }

    try {
      await register(user);
      toast.success("✅ Kayıt başarılı!", { autoClose: 2000 });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "❌ Kayıt başarısız! Lütfen bilgilerinizi kontrol edin.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-box">
        <h2>Kayıt Ol</h2>

        <input name="name" placeholder="Ad" onChange={handleChange} required />
        <input name="surname" placeholder="Soyad" onChange={handleChange} required />
        <input name="username" placeholder="Kullanıcı Adı" onChange={handleChange} required />
        <input name="number" type="text" placeholder="Numara" onChange={handleChange} required />
        <input name="email" type="email" placeholder="E-posta" onChange={handleChange} required />
        <input name="birthdate" type="date" onChange={handleChange} required />

        <PasswordToggle
          name="password"
          placeholder="Şifre"
          value={user.password}
          onChange={handleChange}
        />
        <PasswordToggle
          name="confirmPassword"
          placeholder="Şifre Tekrar"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit">Kayıt Ol</button>

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