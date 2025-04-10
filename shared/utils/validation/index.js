/**
 * Shared validation utilities for Employee360 Task Manager
 */

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
const validateEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password
 * @param {string} password - The password to validate
 * @returns {boolean} - Whether the password is valid
 */
const validatePassword = (password) => {
  if (!password) return false;
  
  // Password should have at least 6 characters, one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  return passwordRegex.test(password);
};

/**
 * Validates a username
 * @param {string} username - The username to validate
 * @returns {boolean} - Whether the username is valid
 */
const validateUsername = (username) => {
  if (!username) return false;
  
  // Username should be 3-30 characters and can contain letters, numbers, and underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * Validates a name (first name, last name)
 * @param {string} name - The name to validate
 * @returns {boolean} - Whether the name is valid
 */
const validateName = (name) => {
  if (!name) return false;
  
  // Name should be 2-50 characters and contain only letters and spaces
  return name.trim().length >= 2 && 
         name.trim().length <= 50 && 
         /^[A-Za-z\s]+$/.test(name);
};

/**
 * Validates a phone number
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return false;
  
  // Basic international phone number validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

/**
 * Validates a date
 * @param {string} dateString - The date string to validate
 * @returns {boolean} - Whether the date is valid
 */
const validateDate = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Validates object ID (MongoDB)
 * @param {string} id - The object ID to validate
 * @returns {boolean} - Whether the ID is valid
 */
const validateObjectId = (id) => {
  if (!id) return false;
  
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validateName,
  validatePhoneNumber,
  validateDate,
  validateObjectId
};