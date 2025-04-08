/**
 * Utility functions for input validation
 */

// Validate password strength
export const validatePassword = (password) => {
  // Only check if password is not empty
  const isValid = password.trim() !== '';
    
  // Return validation result and message
  return {
    isValid,
    message: isValid ? '' : 'Şifre alanı boş bırakılamaz.'
  };
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  return {
    isValid,
    message: isValid ? '' : 'Geçerli bir e-posta adresi giriniz.'
  };
};

// Validate numeric input
export const validateNumber = (number) => {
  const isValid = !isNaN(number) && number.toString().trim() !== '';
  
  return {
    isValid,
    message: isValid ? '' : 'Sadece sayısal değer giriniz.'
  };
};

// Validate required field
export const validateRequired = (value, fieldName) => {
  const isValid = value && value.toString().trim() !== '';
  
  return {
    isValid,
    message: isValid ? '' : `${fieldName} alanı zorunludur.`
  };
};