import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState Component', () => {
  const defaultProps = {
    title: 'No Data',
    message: 'There is no data to display',
    icon: '📊',
    action: <button>Refresh</button>
  };

  it('renders title when provided', () => {
    render(<EmptyState title={defaultProps.title} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
  });

  it('renders message when provided', () => {
    render(<EmptyState message={defaultProps.message} />);
    expect(screen.getByText(defaultProps.message)).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<EmptyState icon={defaultProps.icon} />);
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  it('renders action component when provided', () => {
    render(<EmptyState action={defaultProps.action} />);
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('does not render elements when props are not provided', () => {
    const { container } = render(<EmptyState />);
    const emptyStateDiv = container.firstChild;
    
    expect(emptyStateDiv).toBeInTheDocument();
    expect(emptyStateDiv.children.length).toBe(0);
  });

  it('handles action click events', () => {
    const handleClick = jest.fn();
    render(
      <EmptyState
        action={<button onClick={handleClick}>Click Me</button>}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Click Me' }));
    expect(handleClick).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <EmptyState className="custom-empty-state" />
    );
    expect(container.firstChild).toHaveClass('empty-state', 'custom-empty-state');
  });
});