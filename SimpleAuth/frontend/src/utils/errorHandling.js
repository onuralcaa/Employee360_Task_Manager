/**
 * Centralized error handling utilities
 */

// Format error message from API response
export const formatApiError = (error) => {
  if (error.response && error.response.data) {
    return error.response.data.message || "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
  }
  return error.message || "Sunucu ile bağlantı kurulamadı.";
};

// Handle common form validation errors
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  // Iterate through validation rules
  Object.keys(validationRules).forEach(fieldName => {
    const fieldRules = validationRules[fieldName];
    const fieldValue = formData[fieldName];
    
    // Check each rule for the field
    fieldRules.forEach(rule => {
      if (rule.validator && !rule.validator(fieldValue)) {
        errors[fieldName] = rule.message;
      }
    });
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Global error handler for API requests
export const handleApiError = (error, toast) => {
  const errorMessage = formatApiError(error);
  if (toast) {
    toast.error(errorMessage);
  }
  console.error('API Error:', error);
  return errorMessage;
};