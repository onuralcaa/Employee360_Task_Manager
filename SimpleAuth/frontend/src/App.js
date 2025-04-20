import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import UserPanel from "./components/UserPanel";
import AdminPanel from "./components/AdminPanel";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import TeamPanel from "./components/TeamPanel";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user-panel" element={<UserPanel />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/team-panel" element={<TeamPanel />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
