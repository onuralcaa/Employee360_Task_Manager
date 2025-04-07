import React from 'react';
import './Header.css';
import { useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';

const Header = () => {
  const location = useLocation();

  // Show the header but only keep the theme switcher button
  return (
    <header className="header">
      <div className="header-container">
        <h1 className="logo">Employee360</h1>
        <div className="theme-toggle-container">
          <ThemeToggle className="theme-toggle" />
        </div>
      </div>
    </header>
  );
};

export default Header;