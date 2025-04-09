import React from 'react';
import { ButtonVariants } from '../../types';
import './Button.css';

export const Button = ({ 
  children, 
  variant = ButtonVariants.PRIMARY, 
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
      <span className="button-spinner" />
    ) : children}
  </button>
);