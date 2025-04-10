import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { act } from 'react-dom/test-utils';
import App from '../../App';
import { auth } from '../../api/api';
import { storage } from '../../utils/helpers';

// Mock API and storage
jest.mock('../../api/api');
jest.mock('../../utils/helpers', () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
    remove: jest.fn()
  },
  handleApiError: (error) => error.message || 'An unexpected error occurred'
}));

describe('User Flow Integration Tests', () => {
  const mockUser = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test',
    surname: 'User',
    role: 'employee'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    storage.get.mockImplementation((key) => {
      if (key === 'token') return null;
      if (key === 'user') return null;
      return null;
    });
  });

  describe('Authentication Flow', () => {
    it('completes full registration and login flow', async () => {
      // Mock API responses
      auth.register.mockResolvedValueOnce({
        data: { token: 'register-token', user: mockUser }
      });
      auth.login.mockResolvedValueOnce({
        data: { token: 'login-token', user: mockUser }
      });
      auth.getProfile.mockResolvedValue({ data: mockUser });

      render(
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      );

      // Test Registration
      await act(async () => {
        const signupLink = screen.getByText(/sign up/i);
        fireEvent.click(signupLink);
      });

      await act(async () => {
        fireEvent.change(screen.getByLabelText(/username/i), {
          target: { value: mockUser.username }
        });
        fireEvent.change(screen.getByLabelText(/email/i), {
          target: { value: mockUser.email }
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
          target: { value: 'Password123' }
        });
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
      });

      // Verify registration success
      await waitFor(() => {
        expect(auth.register).toHaveBeenCalledWith({
          username: mockUser.username,
          email: mockUser.email,
          password: 'Password123'
        });
        expect(storage.set).toHaveBeenCalledWith('token', 'register-token');
        expect(storage.set).toHaveBeenCalledWith('user', mockUser);
      });

      // Test Logout
      await act(async () => {
        const logoutButton = screen.getByRole('button', { name: /logout/i });
        fireEvent.click(logoutButton);
      });

      await waitFor(() => {
        expect(storage.clear).toHaveBeenCalled();
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
      });

      // Test Login
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/username/i), {
          target: { value: mockUser.username }
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
          target: { value: 'Password123' }
        });
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));
      });

      // Verify login success and redirection
      await waitFor(() => {
        expect(auth.login).toHaveBeenCalledWith({
          username: mockUser.username,
          password: 'Password123'
        });
        expect(storage.set).toHaveBeenCalledWith('token', 'login-token');
        expect(storage.set).toHaveBeenCalledWith('user', mockUser);
        expect(screen.getByText(new RegExp(`Welcome.*${mockUser.username}`, 'i'))).toBeInTheDocument();
      });
    });

    it('handles authentication errors appropriately', async () => {
      const errorMessage = 'Invalid credentials';
      auth.login.mockRejectedValueOnce(new Error(errorMessage));

      render(
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      );

      await act(async () => {
        fireEvent.change(screen.getByLabelText(/username/i), {
          target: { value: 'wronguser' }
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
          target: { value: 'wrongpass' }
        });
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));
      });

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(storage.set).not.toHaveBeenCalled();
      });
    });
  });

  describe('Profile Management Flow', () => {
    beforeEach(() => {
      // Mock successful authentication
      storage.get.mockImplementation((key) => {
        if (key === 'token') return 'test-token';
        if (key === 'user') return mockUser;
        return null;
      });
      auth.getProfile.mockResolvedValue({ data: mockUser });
    });

    it('allows user to view and update profile', async () => {
      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
        department: 'Product',
        position: 'Manager'
      };

      auth.updateProfile.mockResolvedValueOnce({ data: updatedUser });

      render(
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      );

      // Navigate to profile
      await act(async () => {
        const profileLink = screen.getByText(/profile/i);
        fireEvent.click(profileLink);
      });

      // Verify current profile data is displayed
      await waitFor(() => {
        expect(screen.getByDisplayValue(mockUser.name)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
      });

      // Update profile
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/name/i), {
          target: { value: updatedUser.name }
        });
        fireEvent.change(screen.getByLabelText(/department/i), {
          target: { value: updatedUser.department }
        });
        fireEvent.change(screen.getByLabelText(/position/i), {
          target: { value: updatedUser.position }
        });
        fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      });

      // Verify profile update
      await waitFor(() => {
        expect(auth.updateProfile).toHaveBeenCalledWith(expect.objectContaining({
          name: updatedUser.name,
          department: updatedUser.department,
          position: updatedUser.position
        }));
        expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
        expect(storage.set).toHaveBeenCalledWith('user', updatedUser);
      });
    });

    it('validates profile updates', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      );

      // Navigate to profile
      await act(async () => {
        const profileLink = screen.getByText(/profile/i);
        fireEvent.click(profileLink);
      });

      // Submit with invalid data
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/email/i), {
          target: { value: 'invalid-email' }
        });
        fireEvent.blur(screen.getByLabelText(/email/i));
        fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
      });

      // Verify validation errors
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
        expect(auth.updateProfile).not.toHaveBeenCalled();
      });
    });
  });

  describe('Task Management Flow', () => {
    beforeEach(() => {
      // Mock authenticated admin user
      const adminUser = { ...mockUser, role: 'admin' };
      storage.get.mockImplementation((key) => {
        if (key === 'token') return 'test-token';
        if (key === 'user') return adminUser;
        return null;
      });
      auth.getProfile.mockResolvedValue({ data: adminUser });
    });

    it('allows admin to create and manage tasks', async () => {
      const mockTask = {
        id: 1,
        title: 'New Task',
        description: 'Task Description',
        status: 'pending'
      };

      const mockTasks = [mockTask];

      // Mock API responses
      const dashboardService = {
        getTasks: jest.fn().mockResolvedValue({ data: mockTasks }),
        createTask: jest.fn().mockResolvedValue({ data: mockTask }),
        updateTask: jest.fn().mockResolvedValue({ 
          data: { ...mockTask, status: 'completed' }
        })
      };

      render(
        <BrowserRouter>
          <AuthProvider>
            <App dashboardService={dashboardService} />
          </AuthProvider>
        </BrowserRouter>
      );

      // Create new task
      await act(async () => {
        const createButton = screen.getByRole('button', { name: /create task/i });
        fireEvent.click(createButton);
      });

      await act(async () => {
        fireEvent.change(screen.getByLabelText(/task title/i), {
          target: { value: mockTask.title }
        });
        fireEvent.change(screen.getByLabelText(/description/i), {
          target: { value: mockTask.description }
        });
        fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      });

      // Verify task creation
      await waitFor(() => {
        expect(dashboardService.createTask).toHaveBeenCalledWith(expect.objectContaining({
          title: mockTask.title,
          description: mockTask.description
        }));
        expect(screen.getByText(mockTask.title)).toBeInTheDocument();
      });

      // Update task status
      await act(async () => {
        const taskElement = screen.getByText(mockTask.title);
        const completeButton = taskElement.closest('div').querySelector('button[title="Complete Task"]');
        fireEvent.click(completeButton);
      });

      // Verify task update
      await waitFor(() => {
        expect(dashboardService.updateTask).toHaveBeenCalledWith(
          mockTask.id,
          expect.objectContaining({ status: 'completed' })
        );
        const taskElement = screen.getByText(mockTask.title);
        expect(taskElement.closest('.task-item')).toHaveClass('completed');
      });
    });
  });

  describe('Role-Based Access Control', () => {
    const mockTaskService = {
      getTasks: jest.fn().mockResolvedValue({ data: [] }),
      getTaskStats: jest.fn().mockResolvedValue({ data: { total: 0, completed: 0, pending: 0 } })
    };

    it('restricts admin features for regular employees', async () => {
      // Mock regular employee
      storage.get.mockImplementation((key) => {
        if (key === 'token') return 'test-token';
        if (key === 'user') return mockUser; // regular employee role
        return null;
      });
      auth.getProfile.mockResolvedValue({ data: mockUser });

      render(
        <BrowserRouter>
          <AuthProvider>
            <App dashboardService={mockTaskService} />
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        // Admin-only features should not be visible
        expect(screen.queryByRole('button', { name: /create task/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /manage users/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /view reports/i })).not.toBeInTheDocument();
      });
    });

    it('allows admin access to management features', async () => {
      // Mock admin user
      const adminUser = { ...mockUser, role: 'admin' };
      storage.get.mockImplementation((key) => {
        if (key === 'token') return 'test-token';
        if (key === 'user') return adminUser;
        return null;
      });
      auth.getProfile.mockResolvedValue({ data: adminUser });

      render(
        <BrowserRouter>
          <AuthProvider>
            <App dashboardService={mockTaskService} />
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        // Admin features should be visible
        expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /manage users/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /view reports/i })).toBeInTheDocument();
      });
    });

    it('handles unauthorized access attempts', async () => {
      // Mock expired or invalid token scenario
      storage.get.mockImplementation((key) => {
        if (key === 'token') return 'invalid-token';
        if (key === 'user') return mockUser;
        return null;
      });
      
      const unauthorizedError = new Error('Unauthorized');
      unauthorizedError.response = { status: 401 };
      auth.getProfile.mockRejectedValue(unauthorizedError);

      render(
        <BrowserRouter>
          <AuthProvider>
            <App dashboardService={mockTaskService} />
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        // Should be redirected to login
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
        // Token should be cleared
        expect(storage.clear).toHaveBeenCalled();
      });
    });
  });
});