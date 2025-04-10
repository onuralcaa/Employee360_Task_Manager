import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useForm } from '../../../hooks/useForm';
import { FormInput, Button, Card, Alert } from '../../../components/common/UIComponents';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
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
    {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: 'employee'
    },
    ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'role']
  );

  const onSubmit = async (formValues) => {
    try {
      if (formValues.password !== formValues.confirmPassword) {
        setApiError('Passwords do not match');
        return;
      }

      setApiError('');
      await register(formValues);
      navigate('/login');
    } catch (error) {
      setApiError(error.message || 'Failed to create an account');
    }
  };

  return (
    <div className="register-container">
      <Card title="Create Account" subtitle="Join us today">
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

          <div className="form-row">
            <FormInput
              label="First Name"
              name="firstName"
              required
              value={values.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.firstName}
              touched={touched.firstName}
            />

            <FormInput
              label="Last Name"
              name="lastName"
              required
              value={values.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.lastName}
              touched={touched.lastName}
            />
          </div>

          <FormInput
            label="Email"
            name="email"
            type="email"
            required
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            touched={touched.email}
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

          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            required
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.confirmPassword}
            touched={touched.confirmPassword}
          />

          <div className="role-selection">
            <label>
              <input
                type="radio"
                name="role"
                value="employee"
                checked={values.role === 'employee'}
                onChange={handleChange}
              />
              Employee
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="manager"
                checked={values.role === 'manager'}
                onChange={handleChange}
              />
              Manager
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="register-button"
          >
            Create Account
          </Button>

          <div className="register-footer">
            <p>
              Already have an account?{' '}
              <a href="/login" onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}>
                Sign in
              </a>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Register;