import React from 'react';
import './UIButton.css';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable button component with various styles
 * 
 * @param {Object} props Component props
 * @param {string} props.variant - Button variant (primary, secondary, danger, success)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {boolean} props.isLoading - Loading state
 * @param {React.ReactNode} props.icon - Optional icon to display before text
 * @param {function} props.onClick - Click handler function
 */
const UIButton = ({ 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false,
  isLoading = false,
  icon = null,
  children, 
  className = '',
  ...props 
}) => {
  return (
    <button 
      className={`ui-button ${variant} ${size} ${fullWidth ? 'full-width' : ''} ${isLoading ? 'loading' : ''} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <span className="spinner"></span>}
      {!isLoading && icon && <span className="button-icon">{icon}</span>}
      <span className="button-text">{children}</span>
    </button>
  );
};

export const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <UIButton variant="danger" onClick={handleLogout}>
      Çıkış Yap
    </UIButton>
  );
};

export default UIButton;