import React from 'react';
import PropTypes from 'prop-types';
import './LoadingSpinner.css';

export const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const spinnerClasses = [
    'loading-spinner',
    `loading-spinner-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={spinnerClasses}
      role="progressbar"
      aria-valuetext="Loading..."
    >
      <div className="spinner-circle"></div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string
};