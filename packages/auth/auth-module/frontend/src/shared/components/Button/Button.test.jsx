import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import { ButtonVariants } from '../../types';

describe('Button Component', () => {
  const defaultProps = {
    children: 'Click Me',
    onClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(<Button {...defaultProps} />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    render(<Button {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('renders with different variants', () => {
    Object.values(ButtonVariants).forEach(variant => {
      const { container } = render(
        <Button {...defaultProps} variant={variant} />
      );
      expect(container.firstChild).toHaveClass(`button-${variant}`);
    });
  });

  it('disables button and prevents click when disabled', () => {
    render(<Button {...defaultProps} disabled />);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });

  it('shows loading spinner and disables button when loading', () => {
    render(<Button {...defaultProps} isLoading />);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    expect(button).toHaveClass('loading');
    expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
    expect(screen.queryByText('Click Me')).not.toBeVisible();
  });

  it('renders with different sizes', () => {
    const sizes = ['small', 'medium', 'large'];
    
    sizes.forEach(size => {
      const { container } = render(
        <Button {...defaultProps} size={size} />
      );
      expect(container.firstChild).toHaveClass(`button-${size}`);
    });
  });

  it('renders icon properly', () => {
    const icon = <span data-testid="test-icon">🔍</span>;
    render(<Button {...defaultProps} icon={icon} />);
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('renders icon-only button correctly', () => {
    const icon = <span data-testid="test-icon">🔍</span>;
    const { container } = render(
      <Button icon={icon} iconOnly aria-label="Search" />
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('button-icon-only');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Button {...defaultProps} className="custom-button" />
    );
    expect(container.firstChild).toHaveClass('button', 'custom-button');
  });

  it('forwards additional props', () => {
    render(
      <Button 
        {...defaultProps} 
        data-testid="test-button"
        aria-label="Test Button"
        type="submit"
      />
    );
    
    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('aria-label', 'Test Button');
  });
});