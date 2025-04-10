import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, Alert, FormInput, Card } from './UIComponents';

describe('Button Component', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('button', 'button-primary');
  });

  it('renders with custom variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByText('Secondary');
    expect(button).toHaveClass('button', 'button-secondary');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('Alert Component', () => {
  it('renders message and type correctly', () => {
    render(<Alert message="Test alert" type="error" />);
    const alert = screen.getByText('Test alert');
    expect(alert).toBeInTheDocument();
    expect(alert.parentElement).toHaveClass('alert', 'alert-error');
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(<Alert message="Test alert" onClose={handleClose} />);
    fireEvent.click(screen.getByText('×'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

describe('FormInput Component', () => {
  it('renders label and input', () => {
    render(<FormInput label="Username" name="username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('shows error message when error prop is provided', () => {
    const errorMessage = 'This field is required';
    render(<FormInput label="Username" error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('adds error class when error prop is provided', () => {
    render(<FormInput error="Error message" />);
    expect(screen.getByRole('textbox')).toHaveClass('input-error');
  });
});

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card className="custom-card">Content</Card>);
    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('card', 'custom-card');
  });
});