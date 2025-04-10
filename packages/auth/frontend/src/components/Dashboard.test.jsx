import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { mockAuthContext } from '../__mocks__/authContext';
import Dashboard from './Dashboard';

const mockUser = {
  _id: '123',
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User'
};

const renderDashboard = (authContextValue = { ...mockAuthContext, user: mockUser, isAuthenticated: true }) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authContextValue}>
        <Dashboard />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders welcome message with user name', () => {
    renderDashboard();
    expect(screen.getByText(new RegExp(`Welcome.*${mockUser.username}`, 'i'))).toBeInTheDocument();
  });

  it('renders user profile information', () => {
    renderDashboard();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    if (mockUser.firstName) {
      expect(screen.getByText(new RegExp(mockUser.firstName, 'i'))).toBeInTheDocument();
    }
    if (mockUser.lastName) {
      expect(screen.getByText(new RegExp(mockUser.lastName, 'i'))).toBeInTheDocument();
    }
  });

  it('shows loading state while fetching data', () => {
    renderDashboard({ 
      ...mockAuthContext, 
      user: mockUser, 
      isAuthenticated: true, 
      loading: true 
    });
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays error message when there is an error', () => {
    const errorMessage = 'Failed to load dashboard data';
    renderDashboard({ 
      ...mockAuthContext, 
      user: mockUser, 
      isAuthenticated: true, 
      error: errorMessage 
    });
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('calls logout function when logout button is clicked', async () => {
    const mockLogout = jest.fn();
    renderDashboard({ 
      ...mockAuthContext, 
      user: mockUser, 
      isAuthenticated: true, 
      logout: mockLogout 
    });

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('redirects to login when not authenticated', () => {
    renderDashboard({ 
      ...mockAuthContext, 
      user: null, 
      isAuthenticated: false 
    });
    expect(window.location.pathname).toBe('/login');
  });

  it('renders empty state when no data is available', () => {
    renderDashboard();
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText(/no tasks available/i)).toBeInTheDocument();
  });

  // Add more specific tests based on dashboard features
  it('renders task list when available', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', status: 'pending' },
      { id: 2, title: 'Task 2', status: 'completed' }
    ];

    // Mock the API call that fetches tasks
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(mockTasks),
      ok: true
    });

    renderDashboard();

    await waitFor(() => {
      mockTasks.forEach(task => {
        expect(screen.getByText(task.title)).toBeInTheDocument();
      });
    });
  });

  it('handles task creation', async () => {
    const newTask = { title: 'New Task', description: 'Task description' };
    
    // Mock the API call for creating a task
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ ...newTask, id: 3 }),
      ok: true
    });

    renderDashboard();

    const addButton = screen.getByRole('button', { name: /add task/i });
    fireEvent.click(addButton);

    const titleInput = screen.getByLabelText(/task title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    
    fireEvent.change(titleInput, { target: { value: newTask.title } });
    fireEvent.change(descriptionInput, { target: { value: newTask.description } });
    
    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(newTask.title)).toBeInTheDocument();
    });
  });
});