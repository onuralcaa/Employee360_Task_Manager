import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Register.css";
import PasswordToggle from "./PasswordToggle.jsx";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./common/LoadingSpinner";
import { validatePassword, validateEmail, validateNumber, validateRequired } from "../utils/validation";

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

  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    
    // Clear error when field changes
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate required fields
    const requiredFields = [
      { name: 'name', label: 'Ad' },
      { name: 'surname', label: 'Soyad' },
      { name: 'username', label: 'Kullanıcı Adı' },
      { name: 'email', label: 'E-posta' },
      { name: 'birthdate', label: 'Doğum Tarihi' }
    ];
    
    requiredFields.forEach(field => {
      const validation = validateRequired(user[field.name], field.label);
      if (!validation.isValid) {
        errors[field.name] = validation.message;
      }
    });
    
    // Validate password
    const passwordValidation = validatePassword(user.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }
    
    // Validate password confirmation
    if (user.password !== confirmPassword) {
      errors.confirmPassword = "Şifreler uyuşmuyor!";
    }
    
    // Validate email format
    const emailValidation = validateEmail(user.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message;
    }
    
    // Validate number
    const numberValidation = validateNumber(user.number);
    if (!numberValidation.isValid) {
      errors.number = numberValidation.message;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Display all form errors
      Object.values(formErrors).forEach(error => {
        if (error) toast.error(error);
      });
      return;
    }
    
    await register(user);
  };

  if (loading) {
    return <LoadingSpinner message="Kayıt işlemi yapılıyor..." />;
  }

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-box">
        <h2>Kayıt Ol</h2>

        <input 
          name="name" 
          placeholder="Ad" 
          onChange={handleChange} 
          className={formErrors.name ? "error" : ""}
          required 
        />
        
        <input 
          name="surname" 
          placeholder="Soyad" 
          onChange={handleChange} 
          className={formErrors.surname ? "error" : ""}
          required 
        />
        
        <input 
          name="username" 
          placeholder="Kullanıcı Adı" 
          onChange={handleChange} 
          className={formErrors.username ? "error" : ""}
          required 
        />
        
        <input 
          name="number" 
          type="text" 
          placeholder="Numara" 
          onChange={handleChange} 
          className={formErrors.number ? "error" : ""}
          required 
        />
        
        <input 
          name="email" 
          type="email" 
          placeholder="E-posta" 
          onChange={handleChange} 
          className={formErrors.email ? "error" : ""}
          required 
        />
        
        <input 
          name="birthdate" 
          type="date" 
          onChange={handleChange} 
          className={formErrors.birthdate ? "error" : ""}
          required 
        />

        <PasswordToggle
          name="password"
          placeholder="Şifre"
          value={user.password}
          onChange={handleChange}
          className={formErrors.password ? "error" : ""}
        />
        
        <PasswordToggle
          name="confirmPassword"
          placeholder="Şifre Tekrar"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={formErrors.confirmPassword ? "error" : ""}
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