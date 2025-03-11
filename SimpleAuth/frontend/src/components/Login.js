import { useState } from "react";
import { login } from "../api/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [user, setUser] = useState({ number: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(user);  // 'res' kullanmadığımız için sildik
      alert("Giriş başarılı!");
      navigate("/dashboard");
    } catch (error) {
      alert("Giriş başarısız!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Giriş Yap</h2>
      <input name="number" placeholder="Numara" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Şifre" onChange={handleChange} required />
      <button type="submit">Giriş Yap</button>
    </form>
  );
}

export default Login;
