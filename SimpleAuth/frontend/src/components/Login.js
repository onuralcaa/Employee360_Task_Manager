import { useState } from "react";
import { login } from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

function Login() {
  const [user, setUser] = useState({ username: "", password: "", role: "personel" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(user);
      toast.success(`✅ ${response.data.message}`, { autoClose: 2000 });

      // 👇 DEBUG: Gelen veriyi konsola yaz
      console.log("🟢 Giriş başarılı, gelen data:", response.data);

      // id kontrolü
      if (!response.data.id) {
        throw new Error("ID bilgisi eksik! Backend'den dönmedi.");
      }

      const userState = {
        id: response.data.id,
        role: response.data.role,
        name: response.data.name,
        surname: response.data.surname,
        username: response.data.username,
        phone: response.data.phone,
        email: response.data.email,
        birthdate: response.data.birthdate,
      };

      setTimeout(() => {
        if (response.data.role === "personel") {
          navigate("/user-panel", { replace: true, state: userState });
        } else {
          navigate("/dashboard", { replace: true, state: userState });
        }
      }, 2000);
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || "❌ Giriş başarısız! Lütfen bilgilerinizi kontrol edin.";
      toast.error(errMsg);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-box">
        <h1>Personel360</h1>

        <div className="role-selection">
          <input type="radio" name="role" id="personel" value="personel" checked={user.role === "personel"} onChange={handleChange} />
          <label htmlFor="personel">Personel</label>

          <input type="radio" name="role" id="admin" value="admin" checked={user.role === "admin"} onChange={handleChange} />
          <label htmlFor="admin">Yönetici</label>
        </div>

        <input name="username" placeholder="Kullanıcı Adı" onChange={handleChange} required />

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

        <button type="submit">Giriş Yap</button>

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
