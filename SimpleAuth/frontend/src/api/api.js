import axios from 'axios';
import { storage } from '../utils/helpers';

const api = axios.create({
  baseURL: '/api',  // Changed to use relative path since we're using Vite's proxy
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = storage.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored data on authentication error
      storage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: async (userData) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/users/users', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;
