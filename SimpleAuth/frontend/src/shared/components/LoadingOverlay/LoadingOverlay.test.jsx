import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingOverlay } from './LoadingOverlay';

describe('LoadingOverlay Component', () => {
  const defaultProps = {
    children: <div>Content</div>
  };

  it('renders children when not loading', () => {
    render(<LoadingOverlay {...defaultProps} isLoading={false} />);
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('shows loading spinner and children when loading', () => {
    render(<LoadingOverlay {...defaultProps} isLoading={true} />);
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('applies overlay with correct styles when loading', () => {
    const { container } = render(
      <LoadingOverlay {...defaultProps} isLoading={true} />
    );
    const overlay = container.querySelector('.loading-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveStyle({
      position: 'absolute',
      backgroundColor: 'rgba(255, 255, 255, 0.8)'
    });
  });

  it('maintains container positioning for overlay', () => {
    const { container } = render(
      <LoadingOverlay {...defaultProps} isLoading={true} />
    );
    const loadingContainer = container.firstChild;
    expect(loadingContainer).toHaveStyle({
      position: 'relative'
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <LoadingOverlay 
        {...defaultProps} 
        isLoading={true} 
        className="custom-overlay"
      />
    );
    expect(container.firstChild).toHaveClass('loading-container', 'custom-overlay');
  });

  it('forwards additional props to container', () => {
    render(
      <LoadingOverlay 
        {...defaultProps} 
        isLoading={true}
        data-testid="test-overlay"
        aria-label="Loading content"
      />
    );
    expect(screen.getByTestId('test-overlay')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading content')).toBeInTheDocument();
  });
});