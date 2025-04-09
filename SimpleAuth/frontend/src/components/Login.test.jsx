import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { mockAuthContext } from '../__mocks__/authContext';
import Login from './Login';

const renderLogin = (authContextValue = mockAuthContext) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authContextValue}>
        <Login />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    renderLogin();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('shows error message when fields are empty', async () => {
    renderLogin();
    const loginButton = screen.getByRole('button', { name: /log in/i });
    
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('calls login function with form data', async () => {
    const mockLogin = jest.fn().mockResolvedValue({ success: true });
    renderLogin({ ...mockAuthContext, login: mockLogin });

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });
  });

  it('displays api error message', async () => {
    const errorMessage = 'Invalid credentials';
    const mockLogin = jest.fn().mockRejectedValue(new Error(errorMessage));
    renderLogin({ ...mockAuthContext, login: mockLogin });

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('navigates to register page when signup link is clicked', () => {
    renderLogin();
    const signupLink = screen.getByText(/sign up/i);
    expect(signupLink).toBeInTheDocument();
  });
});