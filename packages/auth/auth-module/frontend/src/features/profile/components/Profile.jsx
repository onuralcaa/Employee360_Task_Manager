import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useForm } from '../../../shared/hooks/useForm';
import { Card, Button, FormInput, Alert } from '../../../components/common/UIComponents';
import { profileService } from '../profileService';
import './Profile.css';

function Profile() {
  const { user, updateUser } = useAuth();
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues
  } = useForm(
    {
      name: '',
      surname: '',
      email: '',
      department: '',
      position: ''
    },
    ['name', 'surname', 'email']
  );

  useEffect(() => {
    if (user) {
      setValues({
        name: user.name || '',
        surname: user.surname || '',
        email: user.email || '',
        department: user.department || '',
        position: user.position || ''
      });
    }
  }, [user, setValues]);

  const onSubmit = async (formValues) => {
    try {
      setApiError('');
      const updatedUser = await profileService.updateProfile(formValues);
      updateUser(updatedUser);
      setSuccess('Profile updated successfully');
    } catch (error) {
      setApiError(error.message || 'Failed to update profile');
    }
  };

  return (
    <div className="profile-container">
      <Card title="Profile Settings">
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

          {success && (
            <Alert 
              type="success" 
              onDismiss={() => setSuccess('')}
            >
              {success}
            </Alert>
          )}

          <div className="form-row">
            <FormInput
              label="First Name"
              name="name"
              required
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.name}
              touched={touched.name}
            />

            <FormInput
              label="Last Name"
              name="surname"
              required
              value={values.surname}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.surname}
              touched={touched.surname}
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

          <div className="form-row">
            <FormInput
              label="Department"
              name="department"
              value={values.department}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.department}
              touched={touched.department}
            />

            <FormInput
              label="Position"
              name="position"
              value={values.position}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.position}
              touched={touched.position}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="profile-submit-button"
          >
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default Profile;