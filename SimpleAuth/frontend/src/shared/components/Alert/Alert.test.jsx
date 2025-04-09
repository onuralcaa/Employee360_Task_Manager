import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Alert from './Alert';

describe('Alert Component', () => {
  const defaultProps = {
    message: 'Test alert message',
    type: 'success',
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders alert message correctly', () => {
    render(<Alert {...defaultProps} />);
    expect(screen.getByText(defaultProps.message)).toBeInTheDocument();
  });

  it('applies correct CSS class based on type', () => {
    const { container } = render(<Alert {...defaultProps} />);
    expect(container.firstChild).toHaveClass('alert-success');

    const { container: errorContainer } = render(
      <Alert {...defaultProps} type="error" />
    );
    expect(errorContainer.firstChild).toHaveClass('alert-error');
  });

  it('calls onClose when close button is clicked', () => {
    render(<Alert {...defaultProps} />);
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('automatically closes after timeout if autoClose is true', () => {
    jest.useFakeTimers();
    render(<Alert {...defaultProps} autoClose={true} timeout={3000} />);
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    jest.advanceTimersByTime(3000);
    expect(defaultProps.onClose).toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it('does not auto-close if autoClose is false', () => {
    jest.useFakeTimers();
    render(<Alert {...defaultProps} autoClose={false} timeout={3000} />);
    
    jest.advanceTimersByTime(3000);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it('clears timeout on unmount', () => {
    jest.useFakeTimers();
    const { unmount } = render(
      <Alert {...defaultProps} autoClose={true} timeout={3000} />
    );
    
    unmount();
    jest.advanceTimersByTime(3000);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it('renders different alert types with correct styles', () => {
    const types = ['info', 'success', 'warning', 'error'];
    
    types.forEach(type => {
      const { container } = render(
        <Alert {...defaultProps} type={type} />
      );
      expect(container.firstChild).toHaveClass(`alert-${type}`);
    });
  });

  it('renders custom class names when provided', () => {
    const { container } = render(
      <Alert {...defaultProps} className="custom-alert" />
    );
    expect(container.firstChild).toHaveClass('custom-alert');
  });

  it('renders alert without close button when onClose is not provided', () => {
    const { onClose, ...propsWithoutClose } = defaultProps;
    render(<Alert {...propsWithoutClose} />);
    
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });
});