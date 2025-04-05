// Context for managing authentication state across the application
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, register as apiRegister } from '../api/api';
import { toast } from 'react-toastify';

// Create the auth context
const AuthContext = createContext(null);

// Custom hook for using the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component to wrap the application
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Parse the JWT token to get user info
        const parsedToken = parseJwt(token);
        if (parsedToken) {
          console.log('Found token on load, parsed data:', parsedToken);
          setUser({
            name: parsedToken.name,
            role: parsedToken.role,
            username: parsedToken.username,
            // Add other user properties as needed
          });
        }
      } catch (error) {
        console.error('Error parsing token:', error);
        localStorage.removeItem('token');
      }
    } else {
      console.log('No token found on initial load');
    }
    setLoading(false);
  }, []);

  // Parse JWT function
  const parseJwt = (token) => {
    try {
      return JSON.parse(window.atob(token.split('.')[1]));
    } catch (e) {
      console.error('Token parsing error:', e);
      return null;
    }
  };

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    console.log('Login attempt with:', { ...credentials, password: '****' });
    
    try {
      const response = await apiLogin(credentials);
      console.log('Login API response:', response);
      
      if (!response.data) {
        throw new Error('No data received from login API');
      }
      
      const { token } = response.data;
      
      if (!token) {
        throw new Error('No token received in login response');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set user state
      const parsedToken = parseJwt(token);
      console.log('Parsed token data:', parsedToken);
      
      if (!parsedToken) {
        throw new Error('Failed to parse token data');
      }
      
      setUser({
        name: parsedToken.name,
        role: parsedToken.role,
        username: parsedToken.username,
      });
      
      toast.success(`${response.data.message || 'Login successful!'}`, { autoClose: 2000 });
      
      // Navigate immediately instead of using setTimeout
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Login Error:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || 'Giriş başarısız! Lütfen bilgilerinizi kontrol edin.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    try {
      await apiRegister(userData);
      toast.success('Kayıt başarılı!', { autoClose: 2000 });
      setTimeout(() => navigate('/login'), 2000);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Kayıt başarısız! Lütfen bilgilerinizi kontrol edin.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Çıkış yapıldı!', { autoClose: 2000 });
    setTimeout(() => navigate('/login'), 2000);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Context value
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};