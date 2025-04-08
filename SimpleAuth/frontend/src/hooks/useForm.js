import { useState, useCallback } from 'react';
import { validateForm } from '../utils/helpers';

export function useForm(initialValues = {}, validationFields = []) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const fieldErrors = validateForm(values, [name]);
    setErrors(prev => ({ ...prev, ...fieldErrors }));
  }, [values]);

  const handleSubmit = useCallback(async (onSubmit) => {
    try {
      setIsSubmitting(true);
      
      // Validate all fields
      const formErrors = validateForm(values, validationFields);
      setErrors(formErrors);
      
      // Mark all fields as touched
      const touchedFields = validationFields.reduce((acc, field) => ({
        ...acc,
        [field]: true
      }), {});
      setTouched(touchedFields);

      // If there are errors, don't submit
      if (Object.keys(formErrors).length > 0) {
        return;
      }

      // Call the submit handler
      await onSubmit(values);
      
      // Reset form state on successful submission if needed
      // setValues(initialValues);
      // setTouched({});
      // setErrors({});
    } catch (error) {
      // Handle submission error
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'An error occurred while submitting the form'
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validationFields]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError
  };
}