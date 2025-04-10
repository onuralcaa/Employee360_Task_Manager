import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import * as authService from '../features/auth/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = storage.get('user');
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const response = await authService.login(credentials);
      storage.set('token', response.data.token);
      storage.set('user', response.data.user);
      setUser(response.data.user);
      setError(null);
      return response.data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const response = await authService.register(userData);
      storage.set('token', response.data.token);
      storage.set('user', response.data.user);
      setUser(response.data.user);
      setError(null);
      return response.data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const updateUser = useCallback(async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      storage.set('user', response.data);
      setUser(response.data);
      setError(null);
      return response.data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    storage.clear();
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!user;
  }, [user]);

  const value = {
    user,
    error,
    loading,
    login,
    register,
    updateUser,
    logout,
    clearError,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };