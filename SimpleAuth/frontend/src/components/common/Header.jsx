import React from 'react';
import PropTypes from 'prop-types';
import './Header.css';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { LogoutButton } from './UIButton';
import { useAuth } from '../../contexts/AuthContext';

function Header({ title = 'Employee360', links = [] }) {
  const { user } = useAuth();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';

  return (
    <header className="header">
      <div className="header-left">
        <h1>{title}</h1>
      </div>
      <nav className="header-nav">
        {links.map((link) => (
          <Link key={link.path} to={link.path} className="header-link">
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="header-right">
        <ThemeToggle />
        {!isLoginPage && user && <LogoutButton />}
      </div>
    </header>
  );
}

Header.propTypes = {
  title: PropTypes.string,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
};

export default Header;