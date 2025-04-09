import { useState, useCallback } from 'react';

export function useForm(initialValues = {}, validationFields = []) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    // Add your validation logic here
    if (!value && validationFields.includes(name)) {
      return `${name} is required`;
    }
    return '';
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  }, [errors]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  }, []);

  const handleSubmit = useCallback(async (onSubmit) => {
    try {
      setIsSubmitting(true);
      
      // Validate all fields
      const newErrors = {};
      validationFields.forEach(field => {
        const error = validateField(field, values[field]);
        if (error) newErrors[field] = error;
      });

      setErrors(newErrors);
      
      // Mark all fields as touched
      const touchedFields = validationFields.reduce((acc, field) => ({
        ...acc,
        [field]: true
      }), {});
      setTouched(touchedFields);

      // If there are errors, don't submit
      if (Object.keys(newErrors).length > 0) {
        return;
      }

      await onSubmit(values);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'An error occurred'
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

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  };
}