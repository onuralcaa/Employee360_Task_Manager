import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { mockAuthContext } from '../__mocks__/authContext';
import Register from './Register';

const renderRegister = (authContextValue = mockAuthContext) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authContextValue}>
        <Register />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders registration form', () => {
    renderRegister();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderRegister();
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderRegister();
    const emailInput = screen.getByLabelText(/email/i);
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('validates password requirements', async () => {
    renderRegister();
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.blur(passwordInput);
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('calls register function with form data', async () => {
    const mockRegister = jest.fn().mockResolvedValue({ success: true });
    renderRegister({ ...mockAuthContext, register: mockRegister });

    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123'
    };

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: userData.username }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: userData.email }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: userData.password }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(userData);
    });
  });

  it('displays error message on registration failure', async () => {
    const errorMessage = 'Username already exists';
    const mockRegister = jest.fn().mockRejectedValue(new Error(errorMessage));
    renderRegister({ ...mockAuthContext, register: mockRegister });

    const userData = {
      username: 'existinguser',
      email: 'test@example.com',
      password: 'Password123'
    };

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: userData.username }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: userData.email }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: userData.password }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('has link to login page', () => {
    renderRegister();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/log in/i)).toHaveAttribute('href', '/login');
  });
});