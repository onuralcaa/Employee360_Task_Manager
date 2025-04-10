import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './Modal.css';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footerButtons,
  className = ''
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      role="dialog"
      data-testid="modal-overlay"
      onClick={onClose}
    >
      <div
        className={`modal ${className}`}
        aria-labelledby="modal-title"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">
            {title}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="modal-content" data-testid="modal-content">
          {children}
        </div>
        {footerButtons && (
          <div className="modal-footer">
            {footerButtons}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  footerButtons: PropTypes.node,
  className: PropTypes.string
};