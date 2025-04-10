// Validation regex patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;

// Validation helpers
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (!passwordRegex.test(password)) {
    return 'Password must contain at least one letter and one number';
  }
  return '';
};

export const validateUsername = (username) => {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 30) return 'Username cannot exceed 30 characters';
  if (!usernameRegex.test(username)) {
    return 'Username can only contain letters, numbers and underscores';
  }
  return '';
};

export const validateName = (name, fieldName = 'Name') => {
  if (!name) return `${fieldName} is required`;
  if (name.length < 2) return `${fieldName} must be at least 2 characters`;
  if (name.length > 50) return `${fieldName} cannot exceed 50 characters`;
  return '';
};

// Form validation
export const validateForm = (values, fields) => {
  const errors = {};

  fields.forEach(field => {
    switch (field) {
      case 'email':
        const emailError = validateEmail(values.email);
        if (emailError) errors.email = emailError;
        break;

      case 'password':
        const passwordError = validatePassword(values.password);
        if (passwordError) errors.password = passwordError;
        break;

      case 'username':
        const usernameError = validateUsername(values.username);
        if (usernameError) errors.username = usernameError;
        break;

      case 'name':
        const nameError = validateName(values.name, 'First name');
        if (nameError) errors.name = nameError;
        break;

      case 'surname':
        const surnameError = validateName(values.surname, 'Last name');
        if (surnameError) errors.surname = surnameError;
        break;

      default:
        if (!values[field]) {
          errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        }
    }
  });

  return errors;
};

// Error handling helpers
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return error.message || 'An unexpected error occurred';
};

// Format date helper
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Theme management
export const initializeTheme = () => {
  const root = document.documentElement;
  const theme = {
    '--background-color': '#ffffff',
    '--background-primary': '#f8f9fa',
    '--background-secondary': '#e9ecef',
    '--text-primary': '#212529',
    '--text-secondary': '#6c757d',
    '--border-color': '#dee2e6',
    '--border-radius-sm': '0.25rem',
    '--border-radius-md': '0.5rem',
    '--border-radius-lg': '1rem',
    '--shadow-sm': '0 1px 3px rgba(0,0,0,0.12)',
    '--shadow-md': '0 4px 6px rgba(0,0,0,0.12)',
    '--shadow-lg': '0 10px 15px rgba(0,0,0,0.12)',
    '--transition-fast': '0.2s ease',
    '--transition-medium': '0.3s ease',
    '--header-height': '64px',
    '--footer-height': '80px'
  };

  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};