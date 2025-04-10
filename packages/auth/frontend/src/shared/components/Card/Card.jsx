import React from 'react';
import './Card.css';

export const Card = ({ 
  children, 
  title, 
  subtitle,
  className = '', 
  ...props 
}) => (
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