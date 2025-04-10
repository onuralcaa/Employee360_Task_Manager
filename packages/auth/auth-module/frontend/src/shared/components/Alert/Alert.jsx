import React from 'react';
import PropTypes from 'prop-types';
import './Alert.css';

export const Alert = ({ message, type = 'info', onDismiss, className = '', children }) => (
  <div className={`alert alert-${type} ${className}`} role="alert">
    <div className="alert-content">
      {children || message}
    </div>
    {onDismiss && (
      <button 
        className="alert-dismiss"
        onClick={onDismiss}
        aria-label="Close alert"
      >
        ×
      </button>
    )}
  </div>
);

Alert.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  onDismiss: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node
};