import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { mockAuthContext } from '../../__mocks__/authContext';
import { ROUTES, USER_ROLES } from '../../shared/constants';
import Header from './Header';

const mockUser = {
  _id: '123',
  name: 'Test User',
  role: 'employee'
};

const mockAdminUser = {
  _id: '456',
  name: 'Admin User',
  role: USER_ROLES.ADMIN
};

const renderHeader = (authContextValue = mockAuthContext, initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthContext.Provider value={authContextValue}>
        <Header />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hides header on login page', () => {
    renderHeader(mockAuthContext, ROUTES.LOGIN);
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('hides header on register page', () => {
    renderHeader(mockAuthContext, ROUTES.REGISTER);
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('shows logo and navigation when authenticated', () => {
    renderHeader({ 
      ...mockAuthContext, 
      isAuthenticated: () => true,
      user: mockUser 
    });

    expect(screen.getByText('Employee360')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('displays user name when authenticated', () => {
    renderHeader({ 
      ...mockAuthContext, 
      isAuthenticated: () => true,
      user: mockUser 
    });

    expect(screen.getByText(`Welcome, ${mockUser.name}`)).toBeInTheDocument();
  });

  it('shows admin links for admin users', () => {
    renderHeader({ 
      ...mockAuthContext, 
      isAuthenticated: () => true,
      user: mockAdminUser 
    });

    expect(screen.getByText('Manage Users')).toBeInTheDocument();
  });

  it('does not show admin links for non-admin users', () => {
    renderHeader({ 
      ...mockAuthContext, 
      isAuthenticated: () => true,
      user: mockUser 
    });

    expect(screen.queryByText('Manage Users')).not.toBeInTheDocument();
  });

  it('calls logout function when logout button is clicked', () => {
    const mockLogout = jest.fn();
    renderHeader({ 
      ...mockAuthContext, 
      isAuthenticated: () => true,
      user: mockUser,
      logout: mockLogout
    });

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('has correct navigation links', () => {
    renderHeader({ 
      ...mockAuthContext, 
      isAuthenticated: () => true,
      user: mockUser 
    });

    expect(screen.getByRole('link', { name: 'Employee360' })).toHaveAttribute('href', ROUTES.DASHBOARD);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', ROUTES.DASHBOARD);
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', ROUTES.PROFILE);
  });
});