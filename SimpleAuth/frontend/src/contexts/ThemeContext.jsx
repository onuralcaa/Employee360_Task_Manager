import { createContext, useContext, useEffect, useState } from 'react';

// Available theme options
export const themes = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Create the theme context
const ThemeContext = createContext(null);

// Custom hook for using the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme provider component to wrap the application
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Try to get stored theme from localStorage or default to system
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || themes.SYSTEM;
  });

  // Apply theme class to document body
  useEffect(() => {
    // Remove all theme classes
    document.body.classList.remove('theme-light', 'theme-dark');
    
    // Determine which theme to use
    if (theme === themes.SYSTEM) {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
    } else {
      // Apply selected theme
      document.body.classList.add(`theme-${theme}`);
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle through themes: light -> dark -> system -> light...
  const cycleTheme = () => {
    setTheme(current => {
      switch(current) {
        case themes.LIGHT: return themes.DARK;
        case themes.DARK: return themes.SYSTEM;
        default: return themes.LIGHT;
      }
    });
  };

  // Directly set a specific theme
  const setSpecificTheme = (newTheme) => {
    if (Object.values(themes).includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  // Watch for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Force re-render when system preference changes and theme is set to "system"
    const handleChange = () => {
      if (theme === themes.SYSTEM) {
        // We need to update the body class
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(mediaQuery.matches ? 'theme-dark' : 'theme-light');
      }
    };
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    // Cleanup
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Context value
  const value = {
    theme,
    cycleTheme,
    setTheme: setSpecificTheme,
    themes
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};