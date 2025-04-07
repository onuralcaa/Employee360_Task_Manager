import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Components
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import Dashboard from './components/Dashboard.jsx'
import PersonelPage from './components/PersonelPage.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import ThemeToggle from './components/common/ThemeToggle.jsx'
import Header from './components/common/Header.jsx'
import Footer from './components/common/Footer.jsx'
import './App.css'

// Auth components and context
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProtectedRoute, AuthRoute } from './components/common/ProtectedRoute'

// Unauthorized page
const Unauthorized = () => (
  <div className="unauthorized-container">
    <h1>Yetkisiz Erişim</h1>
    <p>Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
    <a href="/dashboard">Ana Sayfaya Dön</a>
  </div>
)

// App Component with Auth Provider
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Header 
            links={[
              { path: '/dashboard', label: 'Dashboard' },
              { path: '/', label: 'Ana Sayfa' }
            ]}
            hideOnLoginPage={true}
          />
          <main>
            <Routes>
              {/* Public routes */}
              <Route element={<AuthRoute />}>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              
              {/* Protected routes for all authenticated users */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              
              {/* Protected routes for personnel only */}
              <Route element={<ProtectedRoute roleRequired="personel" />}>
                <Route path="/personel" element={<PersonelPage />} />
              </Route>

              {/* Protected routes for admin only */}
              <Route element={<ProtectedRoute roleRequired="admin" />}>
                <Route path="/admin" element={<AdminPanel />} />
              </Route>
              
              {/* Unauthorized access page */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* 404 page */}
              <Route path="*" element={
                <div className="not-found">
                  <h1>Employee360 Görev Yöneticisi</h1>
                  <p>Sayfa bulunamadı. Lütfen <a href="/">giriş sayfasına</a> gidin.</p>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="top-center" />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App