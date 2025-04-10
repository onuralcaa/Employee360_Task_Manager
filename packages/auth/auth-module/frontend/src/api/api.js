import axios from 'axios';
import { storage } from '../utils/storage';

const api = axios.create({
  baseURL: process.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add auth header if token exists
api.interceptors.request.use(
  (config) => {
    const token = storage.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Clear auth data on unauthorized
        storage.remove('token');
        storage.remove('user');
      }
      throw new Error(error.response.data.message || 'An error occurred');
    }
    throw new Error('Network Error');
  }
);

export default api;
