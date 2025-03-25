import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import PersonelPage from "./components/PersonelPage"; // Import the new component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} /> {/* Giriş sayfasını varsayılan olarak aç */}
        <Route path="/register" element={<Register />} /> {/* Kayıt sayfasının yolu değiştirildi */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/personel" element={<PersonelPage />} /> {/* Add the new route */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
