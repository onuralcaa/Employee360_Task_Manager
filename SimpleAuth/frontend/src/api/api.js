import axios from 'axios';
import { handleApiError } from '../utils/errorHandling';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/users',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to attach auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API calls
export const login = async (credentials) => {
  try {
    return await apiClient.post('/login', credentials);
  } catch (error) {
    handleApiError(error, null); // Log error without showing toast
    throw error;
  }
};

export const register = async (userData) => {
  try {
    console.log('Register API call with data:', userData);
    return await apiClient.post('/register', userData);
  } catch (error) {
    handleApiError(error, null); // Log error without showing toast
    throw error;
  }
};

// User data API calls
export const fetchUserProfile = async () => {
  try {
    return await apiClient.get('/profile');
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    return await apiClient.put('/profile', userData);
  } catch (error) {
    throw error;
  }
};

// Task API calls (for future implementation)
export const fetchTasks = async () => {
  try {
    return await apiClient.get('/tasks');
  } catch (error) {
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    return await apiClient.post('/tasks', taskData);
  } catch (error) {
    throw error;
  }
};

export const updateTask = async (taskId, taskData) => {
  try {
    return await apiClient.put(`/tasks/${taskId}`, taskData);
  } catch (error) {
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    return await apiClient.delete(`/tasks/${taskId}`);
  } catch (error) {
    throw error;
  }
};
