import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from '../hooks/useForm';
import { FormInput, Button, Card, Alert } from './common/UIComponents';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = useState('');

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm(
    { username: '', password: '' },
    ['username', 'password']
  );

  const onSubmit = async (formValues) => {
    try {
      setApiError('');
      await login(formValues);
      navigate('/dashboard');
    } catch (error) {
      setApiError(error.message || 'Failed to log in');
    }
  };

  return (
    <div className="login-container">
      <Card title="Welcome Back" subtitle="Sign in to continue">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit);
        }}>
          {apiError && (
            <Alert 
              type="error" 
              onDismiss={() => setApiError('')}
            >
              {apiError}
            </Alert>
          )}

          <FormInput
            label="Username"
            name="username"
            type="text"
            required
            value={values.username}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.username}
            touched={touched.username}
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            required
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            touched={touched.password}
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="login-button"
          >
            Log In
          </Button>

          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <a href="/register" onClick={(e) => {
                e.preventDefault();
                navigate('/register');
              }}>
                Sign up
              </a>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Login;