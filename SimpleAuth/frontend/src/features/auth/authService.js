import api from '../../api/api';
import { storage } from '../../utils/helpers';
import { AuthActionTypes } from './types';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    if (response.data) {
      storage.set('token', response.data.token);
      storage.set('user', response.data.user);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  logout: () => {
    storage.clear();
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    if (response.data) {
      storage.set('user', response.data);
    }
    return response.data;
  },

  getCurrentUser: () => {
    return storage.get('user');
  },

  isAuthenticated: () => {
    return !!storage.get('token');
  }
};