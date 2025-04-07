import React from 'react';
import { FaSun, FaMoon, FaDesktop } from 'react-icons/fa';
import { useTheme, themes } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, cycleTheme } = useTheme();

  // Get icon based on current theme
  const getThemeIcon = () => {
    switch (theme) {
      case themes.LIGHT:
        return <FaSun className="theme-icon" />;
      case themes.DARK:
        return <FaMoon className="theme-icon" />;
      case themes.SYSTEM:
        return <FaDesktop className="theme-icon" />;
      default:
        return <FaSun className="theme-icon" />;
    }
  };

  // Get text based on current theme
  const getThemeText = () => {
    switch (theme) {
      case themes.LIGHT:
        return 'Aydınlık Mod';
      case themes.DARK:
        return 'Karanlık Mod';
      case themes.SYSTEM:
        return 'Sistem Teması';
      default:
        return 'Aydınlık Mod';
    }
  };

  return (
    <button className="theme-toggle-button" onClick={cycleTheme}>
      {getThemeIcon()}
      <span className="theme-text">{getThemeText()}</span>
    </button>
  );
};

export default ThemeToggle;