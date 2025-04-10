import React from 'react';
import './UIComponents.css';

export const Card = ({ children, title, subtitle, className = '', ...props }) => (
  <div className={`card ${className}`} {...props}>
    {(title || subtitle) && (
      <div className="card-header">
        {title && <h2 className="card-title">{title}</h2>}
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
    )}
    <div className="card-body">
      {children}
    </div>
  </div>
);

export const Button = ({ 
  children, 
  variant = 'primary', 
  isLoading = false,
  className = '', 
  ...props 
}) => (
  <button 
    className={`button button-${variant} ${isLoading ? 'loading' : ''} ${className}`} 
    disabled={isLoading || props.disabled}
    {...props}
  >
    {isLoading ? (
      <div className="button-spinner" />
    ) : children}
  </button>
);

export const Alert = ({ children, type = 'info', onDismiss, className = '' }) => (
  <div className={`alert alert-${type} ${className}`}>
    <span>{children}</span>
    {onDismiss && (
      <button className="alert-dismiss" onClick={onDismiss}>
        ×
      </button>
    )}
  </div>
);

export const FormInput = ({ 
  label, 
  name,
  error,
  touched,
  required,
  className = '',
  type = 'text',
  ...props 
}) => (
  <div className={`form-group ${className} ${error && touched ? 'has-error' : ''}`}>
    <label htmlFor={name}>
      {label}
      {required && <span className="required">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      className={`form-control ${error && touched ? 'input-error' : ''} ${touched ? 'input-touched' : ''}`}
      required={required}
      {...props}
    />
    {error && touched && <span className="error-message">{error}</span>}
  </div>
);

export const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
);