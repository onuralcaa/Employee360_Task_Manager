import { auth } from './authService';
import api from '../../api/api';

// Mock the api module
jest.mock('../../api/api');

describe('authService', () => {
  const mockUser = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test',
    surname: 'User'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginData = {
      username: 'testuser',
      password: 'password123'
    };

    it('logs in user successfully', async () => {
      const mockResponse = {
        data: {
          token: 'mock-token',
          user: mockUser
        }
      };
      api.post.mockResolvedValueOnce(mockResponse);

      const result = await auth.login(loginData);
      expect(api.post).toHaveBeenCalledWith('/auth/login', loginData);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('handles login failure', async () => {
      const error = new Error('Invalid credentials');
      api.post.mockRejectedValueOnce(error);

      await expect(auth.login(loginData)).rejects.toThrow(error);
    });
  });

  describe('register', () => {
    const registerData = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      name: 'New',
      surname: 'User'
    };

    it('registers user successfully', async () => {
      const mockResponse = {
        data: {
          ...registerData,
          id: '456'
        }
      };
      api.post.mockResolvedValueOnce(mockResponse);

      const result = await auth.register(registerData);
      expect(api.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('handles registration failure', async () => {
      const error = new Error('Username already exists');
      api.post.mockRejectedValueOnce(error);

      await expect(auth.register(registerData)).rejects.toThrow(error);
    });
  });

  describe('getProfile', () => {
    it('fetches user profile successfully', async () => {
      const mockResponse = { data: mockUser };
      api.get.mockResolvedValueOnce(mockResponse);

      const result = await auth.getProfile();
      expect(api.get).toHaveBeenCalledWith('/users/profile');
      expect(result.data).toEqual(mockUser);
    });

    it('handles profile fetch failure', async () => {
      const error = new Error('Failed to fetch profile');
      api.get.mockRejectedValueOnce(error);

      await expect(auth.getProfile()).rejects.toThrow(error);
    });
  });

  describe('updateProfile', () => {
    const updateData = {
      name: 'Updated',
      surname: 'User',
      email: 'updated@example.com'
    };

    it('updates profile successfully', async () => {
      const mockResponse = {
        data: {
          ...mockUser,
          ...updateData
        }
      };
      api.put.mockResolvedValueOnce(mockResponse);

      const result = await auth.updateProfile(updateData);
      expect(api.put).toHaveBeenCalledWith('/users/profile', updateData);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('handles profile update failure', async () => {
      const error = new Error('Failed to update profile');
      api.put.mockRejectedValueOnce(error);

      await expect(auth.updateProfile(updateData)).rejects.toThrow(error);
    });
  });

  describe('verifyToken', () => {
    it('verifies token successfully', async () => {
      const mockResponse = { data: { valid: true } };
      api.post.mockResolvedValueOnce(mockResponse);

      const token = 'mock-token';
      const result = await auth.verifyToken(token);
      expect(api.post).toHaveBeenCalledWith('/auth/verify', { token });
      expect(result.data).toEqual(mockResponse.data);
    });

    it('handles token verification failure', async () => {
      const error = new Error('Invalid token');
      api.post.mockRejectedValueOnce(error);

      await expect(auth.verifyToken('invalid-token')).rejects.toThrow(error);
    });
  });
});