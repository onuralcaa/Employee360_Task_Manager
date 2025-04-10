import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

// A component that throws an error
const ThrowError = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal content</div>;
};

// Suppress console.error for expected test errors
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ErrorBoundary Component', () => {
  it('renders children when there is no error', () => {
    renderWithRouter(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('displays error UI when child component throws', () => {
    renderWithRouter(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('shows error details in development environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    renderWithRouter(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/test error/i)).toBeInTheDocument();
    process.env.NODE_ENV = originalEnv;
  });

  it('does not show error details in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    renderWithRouter(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.queryByText(/test error/i)).not.toBeInTheDocument();
    process.env.NODE_ENV = originalEnv;
  });

  it('resets error state when try again is clicked', () => {
    const { rerender } = renderWithRouter(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Click try again and rerender with non-throwing content
    screen.getByRole('button', { name: /try again/i }).click();
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });

  it('renders error UI with correct styling', () => {
    const { container } = renderWithRouter(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const errorContainer = container.firstChild;
    expect(errorContainer).toHaveClass('error-boundary');
  });

  it('provides home link in error UI', () => {
    renderWithRouter(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const homeLink = screen.getByRole('link', { name: /back to home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('logs error to console in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const consoleError = jest.spyOn(console, 'error');

    renderWithRouter(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(consoleError).toHaveBeenCalled();
    process.env.NODE_ENV = originalEnv;
  });
});