import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  // Hide header on login and register pages
  if (['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/dashboard">Employee360</Link>
        </div>
        
        {isAuthenticated() && (
          <nav>
            <span className="user-name">
              Welcome, {user?.name}
            </span>
            <Link to="/dashboard">Dashboard</Link>
            {user?.role === 'admin' && (
              <Link to="/users">Manage Users</Link>
            )}
            <Link to="/profile">Profile</Link>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              logout();
            }}>Logout</a>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;