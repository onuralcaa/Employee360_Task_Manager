import React from 'react';
import PropTypes from 'prop-types';
import './FormInput.css';

export const FormInput = ({
  label,
  error,
  touched,
  required,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const inputClasses = [
    'form-control',
    error && touched && 'input-error',
    touched && 'input-touched',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`form-group ${error && touched ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={inputClasses}
        aria-invalid={!!(error && touched)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && touched && (
        <div id={`${inputId}-error`} className="error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

FormInput.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  touched: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string
};