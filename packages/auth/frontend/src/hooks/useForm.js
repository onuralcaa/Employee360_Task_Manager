import { useState, useCallback } from 'react';
import { validateEmail, validatePassword, validateName } from '../utils/helpers';

export const useForm = (initialValues = {}, validationFields = []) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    if (!value && Array.isArray(validationFields) && validationFields.includes(name)) {
      return `${name} is required`;
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleSubmit = (onSubmit) => {
    return async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Validate all fields
      let formErrors = {};
      Object.keys(values).forEach(key => {
        const error = validateField(key, values[key]);
        if (error) {
          formErrors[key] = error;
        }
      });

      setErrors(formErrors);

      if (Object.keys(formErrors).length === 0) {
        try {
          await onSubmit(values);
        } catch (error) {
          setErrors(prev => ({
            ...prev,
            submit: error.message || 'Form submission failed'
          }));
        }
      }
      
      setIsSubmitting(false);
    };
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm
  };
};