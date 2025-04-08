import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../api/api';
import { storage, handleApiError } from '../utils/helpers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = storage.get('user');
        const token = storage.get('token');
        
        if (userData && token) {
          // Verify token is still valid
          const response = await auth.getProfile();
          if (response.data) {
            setUser(userData);
          } else {
            throw new Error('Session expired');
          }
        }
      } catch (error) {
        storage.clear();
        setError(handleApiError(error));
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async ({ username, password }) => {
    try {
      setError(null);
      const response = await auth.login({ username, password });
      const { token, ...userData } = response.data;
      storage.set('token', token);
      storage.set('user', userData);
      setUser(userData);
      return { success: true };
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      await auth.register(userData);
      return { success: true };
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      return { success: false, message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await auth.updateProfile(profileData);
      const updatedUser = response.data;
      storage.set('user', updatedUser);
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    storage.clear();
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  const isAuthenticated = () => !!user;

  const value = {
    user,
    login,
    logout,
    register,
    updateProfile,
    isAuthenticated,
    loading,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};