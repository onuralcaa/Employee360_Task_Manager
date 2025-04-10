import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import { mockAuthContext } from '../../../__mocks__/authContext';
import { dashboardService } from '../dashboardService';
import Dashboard from './Dashboard';
import { USER_ROLES } from '../../../shared/constants';

// Mock the dashboard service
jest.mock('../dashboardService', () => ({
  dashboardService: {
    getTasks: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    getTaskStats: jest.fn()
  }
}));

const mockTasks = [
  { id: 1, title: 'Task 1', status: 'pending' },
  { id: 2, title: 'Task 2', status: 'completed' }
];

const mockUser = {
  id: '123',
  firstName: 'John',
  lastName: 'Doe',
  role: USER_ROLES.EMPLOYEE
};

const mockAdminUser = {
  ...mockUser,
  role: USER_ROLES.ADMIN
};

const renderDashboard = (authContextValue = { ...mockAuthContext, user: mockUser, isAuthenticated: () => true }) => {
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
    dashboardService.getTasks.mockResolvedValue({ data: mockTasks });
  });

  it('shows loading state initially', () => {
    renderDashboard();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays tasks after loading', async () => {
    renderDashboard();

    await waitFor(() => {
      mockTasks.forEach(task => {
        expect(screen.getByText(task.title)).toBeInTheDocument();
      });
    });
  });

  it('displays empty state when no tasks', async () => {
    dashboardService.getTasks.mockResolvedValueOnce({ data: [] });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
      expect(screen.getByText(/you don't have any tasks assigned yet/i)).toBeInTheDocument();
    });
  });

  it('shows error message when task loading fails', async () => {
    const errorMessage = 'Failed to fetch tasks';
    dashboardService.getTasks.mockRejectedValueOnce(new Error(errorMessage));
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows management controls for admin users', async () => {
    renderDashboard({
      ...mockAuthContext,
      user: mockAdminUser,
      isAuthenticated: () => true
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view reports/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /manage team/i })).toBeInTheDocument();
    });
  });

  it('hides management controls for non-admin users', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /create task/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /view reports/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /manage team/i })).not.toBeInTheDocument();
    });
  });

  it('displays welcome message with user name', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(new RegExp(`Welcome, ${mockUser.firstName}`, 'i'))).toBeInTheDocument();
    });
  });

  it('handles logout', async () => {
    const mockLogout = jest.fn();
    renderDashboard({
      ...mockAuthContext,
      user: mockUser,
      isAuthenticated: () => true,
      logout: mockLogout
    });

    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('applies correct status classes to task items', async () => {
    renderDashboard();

    await waitFor(() => {
      const pendingTask = screen.getByText('Task 1').closest('.task-item');
      const completedTask = screen.getByText('Task 2').closest('.task-item');

      expect(pendingTask).toHaveClass('pending');
      expect(completedTask).toHaveClass('completed');
    });
  });

  it('refreshes tasks when refresh action is clicked', async () => {
    dashboardService.getTasks.mockResolvedValueOnce({ data: [] });
    const { rerender } = renderDashboard();

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      
      dashboardService.getTasks.mockResolvedValueOnce({ data: mockTasks });
      fireEvent.click(refreshButton);

      rerender(
        <BrowserRouter>
          <AuthContext.Provider value={{ ...mockAuthContext, user: mockUser, isAuthenticated: () => true }}>
            <Dashboard />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      expect(dashboardService.getTasks).toHaveBeenCalledTimes(2);
    });
  });
});