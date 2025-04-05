/**
 * Utility functions for input validation
 */

// Validate password strength
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isValid = 
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar;
    
  // Return validation result and message
  return {
    isValid,
    message: isValid ? '' : 'Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter içermelidir.'
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