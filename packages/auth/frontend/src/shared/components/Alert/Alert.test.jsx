import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from './Alert';
import { AlertTypes } from '../../types';

describe('Alert Component', () => {
  const defaultProps = {
    message: 'Test alert message',
    type: AlertTypes.SUCCESS,
    onDismiss: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders message correctly', () => {
    render(<Alert {...defaultProps} />);
    expect(screen.getByText(defaultProps.message)).toBeInTheDocument();
  });

  it('renders different alert types with correct classes', () => {
    Object.values(AlertTypes).forEach(type => {
      const { container } = render(
        <Alert {...defaultProps} type={type} />
      );
      expect(container.firstChild).toHaveClass(`alert-${type}`);
    });
  });

  it('calls onDismiss when close button is clicked', () => {
    render(<Alert {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(defaultProps.onDismiss).toHaveBeenCalled();
  });

  it('auto-dismisses after timeout if autoClose is true', () => {
    jest.useFakeTimers();
    
    render(
      <Alert 
        {...defaultProps} 
        autoClose 
        timeout={3000} 
      />
    );

    expect(defaultProps.onDismiss).not.toHaveBeenCalled();
    
    // Fast-forward time
    jest.advanceTimersByTime(3000);
    
    // Verify onDismiss was called
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    
    jest.useRealTimers();
  });

  it('does not auto-dismiss if autoClose is false', () => {
    jest.useFakeTimers();
    render(<Alert {...defaultProps} autoClose={false} timeout={3000} />);
    
    jest.advanceTimersByTime(3000);
    expect(defaultProps.onDismiss).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it('does not show close button when onDismiss is not provided', () => {
    const { onDismiss, ...propsWithoutDismiss } = defaultProps;
    render(<Alert {...propsWithoutDismiss} />);
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('cleans up timeout on unmount', () => {
    jest.useFakeTimers();
    const { unmount } = render(
      <Alert {...defaultProps} autoClose timeout={3000} />
    );
    
    unmount();
    jest.advanceTimersByTime(3000);
    expect(defaultProps.onDismiss).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Alert {...defaultProps} className="custom-alert" />
    );
    expect(container.firstChild).toHaveClass('alert', 'custom-alert');
  });

  it('renders children instead of message when provided', () => {
    render(
      <Alert {...defaultProps}>
        <div>Custom content</div>
      </Alert>
    );
    expect(screen.getByText('Custom content')).toBeInTheDocument();
    expect(screen.queryByText(defaultProps.message)).not.toBeInTheDocument();
  });
});