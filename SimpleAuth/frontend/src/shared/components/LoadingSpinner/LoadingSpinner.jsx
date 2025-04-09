import React from 'react';
import './LoadingSpinner.css';

export const LoadingSpinner = ({ className = '', size = 'medium' }) => (
  <div className={`loading-container ${className}`}>
    <div className={`loading-spinner loading-spinner-${size}`} />
  </div>
);