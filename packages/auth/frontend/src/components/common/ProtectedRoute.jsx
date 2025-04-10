import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner, Alert } from './UIComponents';

function ProtectedRoute() {
  const { isAuthenticated, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner 
          role="progressbar" 
          aria-valuetext="Loading..."
        />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;