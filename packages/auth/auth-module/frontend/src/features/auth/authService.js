import api from '../../api/api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response;
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response;
  },

  verifyToken: async (token) => {
    const response = await api.post('/auth/verify', { token });
    return response;
  }
};