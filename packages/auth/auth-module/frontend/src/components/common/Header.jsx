import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../shared/components';
import { ROUTES, USER_ROLES } from '../../shared/constants';
import './Header.css';

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  // Hide header on login and register pages
  if ([ROUTES.LOGIN, ROUTES.REGISTER].includes(location.pathname)) {
    return null;
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to={ROUTES.DASHBOARD}>Employee360</Link>
        </div>
        
        {isAuthenticated() && (
          <nav>
            <span className="user-name">
              Welcome, {user?.name}
            </span>
            <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
            {user?.role === USER_ROLES.ADMIN && (
              <Link to={ROUTES.USERS}>Manage Users</Link>
            )}
            <Link to={ROUTES.PROFILE}>Profile</Link>
            <Button 
              variant="secondary" 
              onClick={logout}
            >
              Logout
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;