import { useState } from "react";
import { login } from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

function Login() {
  const [user, setUser] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user.username || !user.password) {
      toast.error("Kullanıcı adı ve şifre gereklidir");
      return;
    }
    
    try {
      setLoading(true);
      const response = await login(user);

      if (!response || !response.data || !response.data.token) {
        throw new Error("Sunucudan geçersiz yanıt alındı");
      }

      // Store token and user ID
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.id || response.data._id);

      const role = response.data.role;
      const roleText =
        role === "admin"
          ? "Yönetici"
          : role === "team_leader"
          ? "Takım lideri"
          : "Personel";

      toast.success(`✅ ${roleText} girişi başarılı.`, { autoClose: 2000 });

      // Create user state to pass to the panel components
      const userState = {
        ...response.data,
        id: response.data.id || response.data._id,
        _id: response.data._id || response.data.id, // Including both formats to avoid inconsistencies
      };

      // Directly navigate to the correct panel based on role
      setTimeout(() => {
        if (role.toLowerCase() === "admin") {
          navigate("/admin-panel", { replace: true, state: userState });
        } else if (role.toLowerCase() === "team_leader") {
          navigate("/team-panel", { replace: true, state: userState });
        } else {
          navigate("/user-panel", { replace: true, state: userState });
        }
      }, 2000);
    } catch (error) {
      console.error("Login error:", error);
      const errMsg = error.response?.data?.message || error.message || "❌ Giriş başarısız! Lütfen bilgilerinizi kontrol edin.";
      toast.error(errMsg);
      
      // Clear any existing tokens on login failure
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-box">
        <h1>Personel360</h1>

        <input 
          name="username" 
          placeholder="Kullanıcı Adı" 
          onChange={handleChange} 
          value={user.username}
          disabled={loading}
          required 
        />

        <div className="password-container">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Şifre"
            onChange={handleChange}
            value={user.password}
            disabled={loading}
            required
          />
          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </button>

        <p className="register-link">
          Hesabınız yok mu?{" "}
          <span onClick={() => navigate("/register")} className="register-button">
            Kayıt Ol
          </span>
        </p>

        <p className="forgot-link">
          <span onClick={() => navigate("/forgot-password")} className="forgot-button">
            Şifremi Unuttum
          </span>
        </p>
      </form>

      <ToastContainer position="top-center" />
    </div>
  );
}

export default Login;
