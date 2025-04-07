import React from 'react';
import PropTypes from 'prop-types';
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
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {string} props.className - Additional class names
 */
const UIButton = ({ 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false,
  isLoading = false,
  icon = null,
  children, 
  className = '',
  type = 'button',
  ...props 
}) => {
  return (
    <button 
      type={type}
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

UIButton.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  isLoading: PropTypes.bool,
  icon: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
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