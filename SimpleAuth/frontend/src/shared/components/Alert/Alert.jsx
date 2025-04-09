import React from 'react';
import { AlertTypes } from '../../types';
import './Alert.css';

export const Alert = ({ 
  children, 
  type = AlertTypes.ERROR,
  onDismiss,
  className = '',
  ...props 
}) => (
  <div 
    className={`alert alert-${type} ${className}`}
    role="alert" 
    {...props}
  >
    <div className="alert-content">{children}</div>
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