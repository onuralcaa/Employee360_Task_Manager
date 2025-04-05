import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import Dashboard from './components/Dashboard.jsx'
import PersonelPage from './components/PersonelPage.jsx'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/personel" element={<PersonelPage />} />
        <Route path="*" element={
          <div className="app">
            <h1>Employee360 Task Manager</h1>
            <p>Page not found. Please go to the <a href="/">login page</a>.</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App