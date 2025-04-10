import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { mockAuthContext } from '../../__mocks__/authContext';
import ProtectedRoute from './ProtectedRoute';

const ProtectedComponent = () => <div>Protected Content</div>;

const renderProtectedRoute = (authContextValue = mockAuthContext) => {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <AuthContext.Provider value={authContextValue}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<ProtectedComponent />} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('ProtectedRoute Component', () => {
  it('shows loading spinner while checking auth state', () => {
    renderProtectedRoute({
      ...mockAuthContext,
      loading: true
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    renderProtectedRoute({
      ...mockAuthContext,
      isAuthenticated: () => false,
      loading: false
    });

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders protected content when authenticated', () => {
    renderProtectedRoute({
      ...mockAuthContext,
      isAuthenticated: () => true,
      loading: false
    });

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('displays error message when there is an auth error', () => {
    const errorMessage = 'Authentication failed';
    renderProtectedRoute({
      ...mockAuthContext,
      error: errorMessage,
      loading: false
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('does not show protected content when there is an error', () => {
    renderProtectedRoute({
      ...mockAuthContext,
      error: 'Some error',
      isAuthenticated: () => true,
      loading: false
    });

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});