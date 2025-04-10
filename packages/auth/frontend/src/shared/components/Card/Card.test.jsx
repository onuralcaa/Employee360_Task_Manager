import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <div>Test Content</div>
      </Card>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <Card title="Test Title">
        <div>Content</div>
      </Card>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toHaveClass('card-title');
  });

  it('renders subtitle when provided', () => {
    render(
      <Card title="Title" subtitle="Test Subtitle">
        <div>Content</div>
      </Card>
    );
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toHaveClass('card-subtitle');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Card className="custom-card">
        <div>Content</div>
      </Card>
    );
    expect(container.firstChild).toHaveClass('card', 'custom-card');
  });

  it('does not render header when no title or subtitle', () => {
    const { container } = render(
      <Card>
        <div>Content</div>
      </Card>
    );
    expect(container.querySelector('.card-header')).not.toBeInTheDocument();
  });

  it('forwards additional props to container', () => {
    render(
      <Card data-testid="test-card" aria-label="Test Card">
        <div>Content</div>
      </Card>
    );
    const card = screen.getByTestId('test-card');
    expect(card).toHaveAttribute('aria-label', 'Test Card');
  });

  it('wraps children in card-body', () => {
    const { container } = render(
      <Card>
        <div>Content</div>
      </Card>
    );
    expect(container.querySelector('.card-body')).toBeInTheDocument();
  });
});