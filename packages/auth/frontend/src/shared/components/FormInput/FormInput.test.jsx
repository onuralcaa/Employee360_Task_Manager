import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormInput } from './FormInput';

describe('FormInput Component', () => {
  const defaultProps = {
    label: 'Username',
    name: 'username',
    value: '',
    onChange: jest.fn(),
    onBlur: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders label and input correctly', () => {
    render(<FormInput {...defaultProps} />);
    
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'username');
  });

  it('handles input changes', () => {
    render(<FormInput {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'testuser' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'testuser' })
      })
    );
  });

  it('handles blur events', () => {
    render(<FormInput {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.blur(input);
    expect(defaultProps.onBlur).toHaveBeenCalled();
  });

  it('shows error message when error prop is provided', () => {
    const errorMessage = 'This field is required';
    render(<FormInput {...defaultProps} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('adds error class when error prop is provided', () => {
    render(<FormInput {...defaultProps} error="Error message" />);
    expect(screen.getByRole('textbox')).toHaveClass('input-error');
  });

  it('adds touched class when touched prop is true', () => {
    render(<FormInput {...defaultProps} touched={true} />);
    expect(screen.getByRole('textbox')).toHaveClass('input-touched');
  });

  it('renders password type input correctly', () => {
    render(<FormInput {...defaultProps} type="password" />);
    expect(screen.getByLabelText('Username')).toHaveAttribute('type', 'password');
  });

  it('handles required prop', () => {
    render(<FormInput {...defaultProps} required />);
    expect(screen.getByRole('textbox')).toBeRequired();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <FormInput {...defaultProps} className="custom-input" />
    );
    expect(container.firstChild).toHaveClass('form-group', 'custom-input');
  });

  it('forwards additional props to input element', () => {
    render(
      <FormInput
        {...defaultProps}
        placeholder="Enter username"
        maxLength={20}
        autoComplete="username"
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter username');
    expect(input).toHaveAttribute('maxLength', '20');
    expect(input).toHaveAttribute('autoComplete', 'username');
  });

  it('renders disabled state correctly', () => {
    render(<FormInput {...defaultProps} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders read-only state correctly', () => {
    render(<FormInput {...defaultProps} readOnly />);
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });
});