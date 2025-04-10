import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  className = '',
  icon,
  iconOnly = false,
  ...props
}) => {
  const buttonClasses = [
    'button',
    `button-${variant}`,
    `button-${size}`,
    isLoading && 'loading',
    iconOnly && 'button-icon-only',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <div 
            className="button-spinner" 
            data-testid="button-spinner"
            role="progressbar"
            aria-valuetext="Loading..."
          />
          <span className="sr-only">Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="button-icon">{icon}</span>}
          <span className={isLoading ? 'sr-only' : undefined}>
            {children}
          </span>
        </>
      )}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  icon: PropTypes.node,
  iconOnly: PropTypes.bool
};