import React from 'react';
import PropTypes from 'prop-types';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import './LoadingOverlay.css';

export const LoadingOverlay = ({
  isLoading,
  children,
  message = 'Loading...',
  className = '',
  ...props
}) => {
  const containerClasses = [
    'loading-overlay-container',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={{ position: 'relative' }} {...props}>
      {children}
      {isLoading && (
        <div 
          className="loading-overlay" 
          style={{ 
            position: 'absolute',
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
          }}
        >
          <div className="loading-overlay-content">
            <LoadingSpinner 
              size="large" 
              data-testid="loading-spinner"
              aria-label="Loading content"
            />
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