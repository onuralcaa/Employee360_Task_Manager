import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import { Login, Register } from './features/auth';
import { Dashboard } from './features/dashboard';
import { Profile } from './features/profile';
import ProtectedRoute from './components/common/ProtectedRoute';
import { EmptyState } from './shared/components';
import { ROUTES } from './shared/constants';
import { EmptyStateTypes } from './shared/types';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                {/* Public routes */}
                <Route path={ROUTES.LOGIN} element={<Login />} />
                <Route path={ROUTES.REGISTER} element={<Register />} />
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                  <Route path={ROUTES.PROFILE} element={<Profile />} />
                </Route>
                
                {/* Default redirect */}
                <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                
                {/* 404 route */}
                <Route path="*" element={
                  <EmptyState 
                    type={EmptyStateTypes.NOT_FOUND}
                    title="404 - Page Not Found"
                    message="The page you're looking for doesn't exist."
                    icon="🔍"
                  />
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;