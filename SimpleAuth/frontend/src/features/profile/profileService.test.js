import { profileService } from './profileService';
import api from '../../api/api';

// Mock the api module
jest.mock('../../api/api');

describe('profileService', () => {
  const mockUser = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test',
    surname: 'User',
    department: 'Engineering',
    position: 'Developer'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('fetches profile successfully', async () => {
      const mockResponse = { data: mockUser };
      api.get.mockResolvedValueOnce(mockResponse);

      const result = await profileService.getProfile();
      expect(api.get).toHaveBeenCalledWith('/users/profile');
      expect(result).toEqual(mockUser);
    });

    it('handles profile fetch failure', async () => {
      const error = new Error('Failed to fetch profile');
      api.get.mockRejectedValueOnce(error);

      await expect(profileService.getProfile()).rejects.toThrow(error);
    });
  });

  describe('updateProfile', () => {
    const updateData = {
      name: 'Updated',
      surname: 'User',
      email: 'updated@example.com',
      department: 'Product',
      position: 'Manager'
    };

    it('updates profile successfully', async () => {
      const mockResponse = {
        data: {
          ...mockUser,
          ...updateData
        }
      };
      api.put.mockResolvedValueOnce(mockResponse);

      const result = await profileService.updateProfile(updateData);
      expect(api.put).toHaveBeenCalledWith('/users/profile', updateData);
      expect(result).toEqual(mockResponse.data);
    });

    it('handles profile update failure', async () => {
      const error = new Error('Failed to update profile');
      api.put.mockRejectedValueOnce(error);

      await expect(profileService.updateProfile(updateData)).rejects.toThrow(error);
    });
  });

  describe('changePassword', () => {
    const passwordData = {
      currentPassword: 'oldPass123',
      newPassword: 'newPass123',
      confirmPassword: 'newPass123'
    };

    it('changes password successfully', async () => {
      const mockResponse = {
        data: { message: 'Password updated successfully' }
      };
      api.put.mockResolvedValueOnce(mockResponse);

      const result = await profileService.changePassword(passwordData);
      expect(api.put).toHaveBeenCalledWith('/users/profile/password', passwordData);
      expect(result).toEqual(mockResponse.data);
    });

    it('handles password change failure', async () => {
      const error = new Error('Current password is incorrect');
      api.put.mockRejectedValueOnce(error);

      await expect(profileService.changePassword(passwordData)).rejects.toThrow(error);
    });
  });
});