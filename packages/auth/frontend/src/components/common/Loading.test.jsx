import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingOverlay, LoadingButton } from './Loading';

describe('LoadingOverlay Component', () => {
  it('renders children without overlay when not loading', () => {
    render(
      <LoadingOverlay isLoading={false}>
        <div>Test Content</div>
      </LoadingOverlay>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('renders children with overlay when loading', () => {
    render(
      <LoadingOverlay isLoading={true}>
        <div>Test Content</div>
      </LoadingOverlay>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(document.querySelector('.loading-overlay')).toBeInTheDocument();
    expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
  });
});

describe('LoadingButton Component', () => {
  const defaultProps = {
    onClick: jest.fn(),
    children: 'Click Me'
  };

  it('renders button with children when not loading', () => {
    render(<LoadingButton {...defaultProps} isLoading={false} />);
    
    expect(screen.getByText('Click Me')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toHaveClass('loading');
    expect(document.querySelector('.button-spinner')).not.toBeInTheDocument();
  });

  it('renders spinner and hides text when loading', () => {
    render(<LoadingButton {...defaultProps} isLoading={true} />);
    
    expect(screen.queryByText('Click Me')).not.toBeVisible();
    expect(screen.getByRole('button')).toHaveClass('loading');
    expect(document.querySelector('.button-spinner')).toBeInTheDocument();
  });

  it('disables button when loading', () => {
    render(<LoadingButton {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables button when disabled prop is true', () => {
    render(<LoadingButton {...defaultProps} disabled={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('forwards additional props to button element', () => {
    render(
      <LoadingButton 
        {...defaultProps}
        type="submit"
        data-testid="test-button"
        aria-label="Test Button"
      />
    );
    
    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('aria-label', 'Test Button');
  });
});