import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { auth } from '../api/api';
import { storage } from '../utils/helpers';

// Mock the api and storage utilities
jest.mock('../api/api', () => ({
  auth: {
    login: jest.fn(),
    register: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn()
  }
}));

jest.mock('../utils/helpers', () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn()
  },
  handleApiError: (error) => error.message || 'An unexpected error occurred'
}));

const mockUser = {
  id: '123',
  username: 'testuser',
  email: 'test@example.com'
};

const wrapper = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storage.get.mockImplementation((key) => {
      if (key === 'user') return mockUser;
      if (key === 'token') return 'mock-token';
      return null;
    });
  });

  it('initializes with stored user data', async () => {
    auth.getProfile.mockResolvedValueOnce({ data: mockUser });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles login success', async () => {
    const loginData = {
      username: 'testuser',
      password: 'password123'
    };

    const loginResponse = {
      data: {
        token: 'mock-token',
        ...mockUser
      }
    };

    auth.login.mockResolvedValueOnce(loginResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.login(loginData);
      expect(response.success).toBe(true);
    });

    expect(storage.set).toHaveBeenCalledWith('token', 'mock-token');
    expect(storage.set).toHaveBeenCalledWith('user', mockUser);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
  });

  it('handles login failure', async () => {
    const errorMessage = 'Invalid credentials';
    auth.login.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.login({ 
        username: 'wrong', 
        password: 'wrong' 
      });
      expect(response.success).toBe(false);
      expect(response.message).toBe(errorMessage);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(errorMessage);
  });

  it('handles registration success', async () => {
    const registerData = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123'
    };

    auth.register.mockResolvedValueOnce({ data: registerData });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.register(registerData);
      expect(response.success).toBe(true);
    });

    expect(result.current.error).toBeNull();
  });

  it('handles registration failure', async () => {
    const errorMessage = 'Username already exists';
    auth.register.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.register({
        username: 'existing',
        password: 'password123'
      });
      expect(response.success).toBe(false);
      expect(response.message).toBe(errorMessage);
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('handles logout', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(storage.clear).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('handles profile update success', async () => {
    const updateData = {
      email: 'updated@example.com'
    };

    const updatedUser = {
      ...mockUser,
      ...updateData
    };

    auth.updateProfile.mockResolvedValueOnce({ data: updatedUser });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.updateProfile(updateData);
      expect(response.success).toBe(true);
    });

    expect(storage.set).toHaveBeenCalledWith('user', updatedUser);
    expect(result.current.user).toEqual(updatedUser);
    expect(result.current.error).toBeNull();
  });

  it('handles profile update failure', async () => {
    const errorMessage = 'Failed to update profile';
    auth.updateProfile.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.updateProfile({});
      expect(response.success).toBe(false);
      expect(response.message).toBe(errorMessage);
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('clears error when clearError is called', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('checks authentication status correctly', async () => {
    auth.getProfile.mockResolvedValueOnce({ data: mockUser });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.isAuthenticated()).toBe(true);
    
    act(() => {
      result.current.logout();
    });
    
    expect(result.current.isAuthenticated()).toBe(false);
  });
});