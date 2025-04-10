import React from 'react';
import { render } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders with default size', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
    expect(container.querySelector('.loading-spinner-medium')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const sizes = ['small', 'medium', 'large'];
    
    sizes.forEach(size => {
      const { container } = render(<LoadingSpinner size={size} />);
      expect(container.querySelector(`.loading-spinner-${size}`)).toBeInTheDocument();
    });
  });

  it('includes base loading-spinner class regardless of size', () => {
    const { container } = render(<LoadingSpinner size="small" />);
    const spinner = container.firstChild;
    expect(spinner).toHaveClass('loading-spinner', 'loading-spinner-small');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-spinner" />);
    expect(container.firstChild).toHaveClass('loading-spinner', 'custom-spinner');
  });

  it('maintains accessibility attributes', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.firstChild;
    expect(spinner).toHaveAttribute('role', 'progressbar');
    expect(spinner).toHaveAttribute('aria-valuetext', 'Loading...');
  });

  it('combines all classes correctly', () => {
    const { container } = render(
      <LoadingSpinner 
        size="large" 
        className="custom-spinner"
      />
    );
    const spinner = container.firstChild;
    expect(spinner).toHaveClass(
      'loading-spinner',
      'loading-spinner-large',
      'custom-spinner'
    );
  });
});