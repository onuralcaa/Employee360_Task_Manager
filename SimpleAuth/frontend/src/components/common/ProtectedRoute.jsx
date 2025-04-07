import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Component to protect routes that require authentication
export const ProtectedRoute = ({ roleRequired }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role if required
  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Render the protected content
  return <Outlet />;
};

// Component to redirect authenticated users away from auth pages
export const AuthRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  // Redirect to dashboard if already authenticated
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};