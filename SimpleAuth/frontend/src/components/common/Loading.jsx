import React from 'react';
import './Loading.css';

export const LoadingOverlay = ({ isLoading, children }) => {
  if (!isLoading) return children;

  return (
    <div className="loading-container">
      {children}
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
};

export const LoadingButton = ({ 
  isLoading, 
  children, 
  disabled, 
  ...props 
}) => {
  return (
    <button 
      disabled={isLoading || disabled} 
      className={`loading-button${isLoading ? ' loading' : ''}`}
      {...props}
    >
      {isLoading ? (
        <span className="button-spinner"></span>
      ) : children}
    </button>
  );
};