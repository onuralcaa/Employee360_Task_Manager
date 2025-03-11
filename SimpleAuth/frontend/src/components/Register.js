import { useState } from "react";
import { register } from "../api/api";
import { useNavigate } from "react-router-dom";

function Register() {
  const [user, setUser] = useState({ name: "", surname: "", number: "", password: "" });
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
    <form onSubmit={handleSubmit}>
      <h2>Kayıt Ol</h2>
      <input name="name" placeholder="Ad" onChange={handleChange} required />
      <input name="surname" placeholder="Soyad" onChange={handleChange} required />
      <input name="number" placeholder="Numara" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Şifre" onChange={handleChange} required />
      <button type="submit">Kayıt Ol</button>
    </form>
  );
}

export default Register;
