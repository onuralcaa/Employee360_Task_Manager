import React from 'react';
import './Header.css';
import { useLocation, Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle.jsx';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { logout } = useAuth();
  const location = useLocation();

  // Hide header buttons only on login and root pages
  const hideButtons = location.pathname === '/' || location.pathname === '/login';

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="logo">Employee360</h1>
        {!hideButtons && (
          <nav className="nav-menu">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/">
              <FaHome /> Home
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