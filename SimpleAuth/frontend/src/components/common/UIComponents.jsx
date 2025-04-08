import React from 'react';
import './UIComponents.css';

export const Card = ({ children, className = '', ...props }) => (
  <div className={`card ${className}`} {...props}>
    {children}
  </div>
);

export const Button = ({ children, variant = 'primary', className = '', ...props }) => (
  <button className={`button button-${variant} ${className}`} {...props}>
    {children}
  </button>
);

export const Alert = ({ message, type = 'error', onClose }) => (
  <div className={`alert alert-${type}`}>
    <span>{message}</span>
    {onClose && (
      <button className="alert-close" onClick={onClose}>
        ×
      </button>
    )}
  </div>
);

export const FormInput = ({ label, error, ...props }) => (
  <div className="form-group">
    {label && <label>{label}</label>}
    <input className={error ? 'input-error' : ''} {...props} />
    {error && <span className="error-message">{error}</span>}
  </div>
);

export const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
);