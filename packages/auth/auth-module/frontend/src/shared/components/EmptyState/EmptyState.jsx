import React from 'react';
import { Button } from '../Button/Button';
import { EmptyStateTypes } from '../../types';
import './EmptyState.css';

export const EmptyState = ({
  type = EmptyStateTypes.NO_DATA,
  title,
  message,
  icon,
  actionText,
  onAction,
  className = ''
}) => (
  <div className={`empty-state ${className}`}>
    {icon && <div className="empty-state-icon">{icon}</div>}
    {title && <h3 className="empty-state-title">{title}</h3>}
    {message && <p className="empty-state-message">{message}</p>}
    {actionText && onAction && (
      <div className="empty-state-action">
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      </div>
    )}
  </div>
);