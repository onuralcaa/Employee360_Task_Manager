import React from 'react';
import PropTypes from 'prop-types';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import './LoadingOverlay.css';

export const LoadingOverlay = ({
  isLoading,
  children,
  message = 'Loading...',
  className = ''
}) => {
  if (!isLoading) return children;

  const overlayClasses = ['loading-overlay', className].filter(Boolean).join(' ');

  return (
    <div className="loading-overlay-container">
      {children}
      {isLoading && (
        <div className={overlayClasses}>
          <div className="loading-overlay-content">
            <LoadingSpinner size="large" />
            {message && (
              <div className="loading-message" role="status">
                {message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

LoadingOverlay.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  children: PropTypes.node,
  message: PropTypes.string,
  className: PropTypes.string
};