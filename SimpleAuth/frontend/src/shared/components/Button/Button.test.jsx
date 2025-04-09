import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  const defaultProps = {
    onClick: jest.fn(),
    children: 'Click Me'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders button with children correctly', () => {
    render(<Button {...defaultProps} />);
    expect(screen.getByRole('button')).toHaveTextContent('Click Me');
  });

  it('handles click events', () => {
    render(<Button {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('applies different variants correctly', () => {
    const variants = ['primary', 'secondary', 'danger', 'success'];
    
    variants.forEach(variant => {
      const { container } = render(
        <Button {...defaultProps} variant={variant} />
      );
      expect(container.firstChild).toHaveClass(`btn-${variant}`);
    });
  });

  it('applies size classes correctly', () => {
    const sizes = ['small', 'medium', 'large'];
    
    sizes.forEach(size => {
      const { container } = render(
        <Button {...defaultProps} size={size} />
      );
      expect(container.firstChild).toHaveClass(`btn-${size}`);
    });
  });

  it('handles disabled state correctly', () => {
    render(<Button {...defaultProps} disabled />);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });

  it('renders loading state correctly', () => {
    render(<Button {...defaultProps} loading />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies custom className when provided', () => {
    render(<Button {...defaultProps} className="custom-btn" />);
    expect(screen.getByRole('button')).toHaveClass('custom-btn');
  });

  it('renders as different HTML elements when specified', () => {
    render(<Button {...defaultProps} as="a" href="#" />);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('forwards additional props to the button element', () => {
    render(<Button {...defaultProps} data-testid="test-button" aria-label="Test Button" />);
    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('aria-label', 'Test Button');
  });

  it('combines default and custom styles', () => {
    const { container } = render(
      <Button 
        {...defaultProps} 
        variant="primary"
        size="large"
        className="custom-class"
      />
    );
    const button = container.firstChild;
    expect(button).toHaveClass('btn-primary', 'btn-large', 'custom-class');
  });

  it('renders icon buttons correctly', () => {
    render(
      <Button {...defaultProps} icon={<span data-testid="test-icon" />}>
        {defaultProps.children}
      </Button>
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Click Me');
  });

  it('renders icon-only buttons with proper styling', () => {
    const { container } = render(
      <Button icon={<span data-testid="test-icon" />} iconOnly />
    );
    
    expect(container.firstChild).toHaveClass('btn-icon-only');
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toHaveTextContent('Click Me');
  });

  it('handles full width styling', () => {
    const { container } = render(<Button {...defaultProps} fullWidth />);
    expect(container.firstChild).toHaveClass('btn-full-width');
  });

  it('handles outline variant correctly', () => {
    const { container } = render(<Button {...defaultProps} outline />);
    expect(container.firstChild).toHaveClass('btn-outline');
  });
});