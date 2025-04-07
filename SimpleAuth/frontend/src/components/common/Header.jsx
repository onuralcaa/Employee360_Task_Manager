import React from 'react';
import './Header.css';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import { FaHome } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="logo">Çalışan360</h1>
        {location.pathname !== '/login' && (
          <nav className="nav-menu">
            <Link to="/dashboard">Gösterge Paneli</Link>
            <Link to="/">
              <FaHome /> Ana Sayfa
            </Link>
            <button onClick={logout} className="logout-button">Çıkış Yap</button>
          </nav>
        )}
        <div className="theme-toggle-container">
          <ThemeToggle className="theme-toggle" />
        </div>
      </div>
    </header>
  );
};

export default Header;