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
    username: "",
    number: "",
    email: "",
    birthdate: "",
    password: "",
    role: "personel",
  });

  const [confirmPassword, setConfirmPassword] = useState(""); // 📌 Şifre tekrar
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (isNaN(user.number)) {
    toast.error("❌ Numara sadece sayısal olabilir!");
    return;
  }

  if (user.username.length < 5) {
    toast.error("❌ Kullanıcı adı en az 5 karakter olmalıdır!");
    return;
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  if (!passwordRegex.test(user.password)) {
    toast.error("❌ Şifre en az 6 karakter, 1 harf ve 1 rakam içermelidir!");
    return;
  }

  if (user.password !== confirmPassword) {
    toast.error("❌ Şifreler uyuşmuyor!");
    return;
  }

  const selectedYear = new Date(user.birthdate).getFullYear();
  const currentYear = new Date().getFullYear();
  if (selectedYear > currentYear) {
    toast.error("❌ Doğum yılı geçerli bir yıl olmalıdır!");
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
    {/* Sol taraftaki kayıt formu */}
    <form onSubmit={handleSubmit} className="register-box">
      <h2>Kayıt Ol</h2>

      <input name="name" placeholder="Ad" onChange={handleChange} required />
      <input name="surname" placeholder="Soyad" onChange={handleChange} required />
      <input name="username" placeholder="Kullanıcı Adı" onChange={handleChange} required />
      <input name="number" type="text" placeholder="Numara" onChange={handleChange} required />
      <input name="email" type="email" placeholder="E-posta" onChange={handleChange} required />
      <input name="birthdate" type="date" onChange={handleChange} required />

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

      <div className="password-container">
        <input
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          placeholder="Şifre Tekrar"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      <button type="submit">Kayıt Ol</button>

      <p className="login-link">
        Zaten hesabınız var mı?{" "}
        <span onClick={() => navigate("/login")} className="login-button">
          Giriş Yap
        </span>
      </p>
    </form>

    {/* Sağdaki bilgi bloğu */}
    <div className="register-info-box">
      <h4>Kayıt Kuralları</h4>
      <ul>
        <li>Kullanıcı adı en az 5 karakter olmalıdır.</li>
        <li>Şifre en az 6 karakter, 1 harf ve 1 rakam içermelidir.</li>
        <li>Doğum yılı mevcut yıldan büyük olamaz.</li>
        <li>Numara sadece sayılardan oluşmalıdır.</li>
      </ul>
    </div>

    <ToastContainer position="top-center" />
  </div>
);

}

export default Register;
