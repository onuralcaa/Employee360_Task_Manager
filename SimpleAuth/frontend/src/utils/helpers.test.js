import { 
  formatDate, 
  validateEmail, 
  validatePassword, 
  validateUsername, 
  validateName, 
  formatUserName,
  getErrorMessage
} from './helpers';

describe('Helper Functions', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2025-04-10T12:00:00Z');
      expect(formatDate(date)).toBe('April 10, 2025');
    });

    it('returns "Invalid Date" for invalid input', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date');
    });

    it('handles different date formats', () => {
      const date = '2025-04-10';
      expect(formatDate(date)).toBe('April 10, 2025');
    });
  });

  describe('validateEmail', () => {
    it('validates correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+label@domain.com')).toBe(true);
    });

    it('invalidates incorrect email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('validates passwords meeting requirements', () => {
      expect(validatePassword('Password123')).toBe(true);
      expect(validatePassword('Complex@Pass1')).toBe(true);
    });

    it('invalidates passwords not meeting requirements', () => {
      expect(validatePassword('short')).toBe(false); // Too short
      expect(validatePassword('nodigits')).toBe(false); // No numbers
      expect(validatePassword('1234567')).toBe(false); // No letters
      expect(validatePassword('')).toBe(false); // Empty
    });
  });

  describe('formatUserName', () => {
    it('formats full name correctly', () => {
      expect(formatUserName('John', 'Doe')).toBe('John Doe');
    });

    it('handles missing last name', () => {
      expect(formatUserName('John')).toBe('John');
    });

    it('handles missing first name', () => {
      expect(formatUserName('', 'Doe')).toBe('Doe');
    });

    it('handles empty input', () => {
      expect(formatUserName()).toBe('');
      expect(formatUserName('')).toBe('');
    });
  });

  describe('getErrorMessage', () => {
    it('extracts error message from Error object', () => {
      const error = new Error('Test error message');
      expect(getErrorMessage(error)).toBe('Test error message');
    });

    it('extracts error message from error response', () => {
      const error = {
        response: {
          data: {
            message: 'API error message'
          }
        }
      };
      expect(getErrorMessage(error)).toBe('API error message');
    });

    it('handles string error', () => {
      expect(getErrorMessage('Direct error message')).toBe('Direct error message');
    });

    it('provides default message for undefined error', () => {
      expect(getErrorMessage()).toBe('An unexpected error occurred');
      expect(getErrorMessage(null)).toBe('An unexpected error occurred');
    });

    it('handles error response without message', () => {
      const error = {
        response: {
          data: {}
        }
      };
      expect(getErrorMessage(error)).toBe('An unexpected error occurred');
    });
  });
});

describe('Validation Helpers', () => {
  describe('validateEmail', () => {
    it('should return error for empty email', () => {
      expect(validateEmail('')).toBe('Email is required');
    });

    it('should return error for invalid email format', () => {
      expect(validateEmail('invalid-email')).toBe('Please enter a valid email address');
      expect(validateEmail('test@')).toBe('Please enter a valid email address');
      expect(validateEmail('test@domain')).toBe('Please enter a valid email address');
    });

    it('should return empty string for valid email', () => {
      expect(validateEmail('test@example.com')).toBe('');
      expect(validateEmail('user.name@domain.co.uk')).toBe('');
    });
  });

  describe('validatePassword', () => {
    it('should return error for empty password', () => {
      expect(validatePassword('')).toBe('Password is required');
    });

    it('should return error for password less than 6 characters', () => {
      expect(validatePassword('pass1')).toBe('Password must be at least 6 characters');
    });

    it('should return error for password without letter and number', () => {
      expect(validatePassword('password')).toBe('Password must contain at least one letter and one number');
      expect(validatePassword('12345678')).toBe('Password must contain at least one letter and one number');
    });

    it('should return empty string for valid password', () => {
      expect(validatePassword('password123')).toBe('');
      expect(validatePassword('Pass1234')).toBe('');
    });
  });

  describe('validateUsername', () => {
    it('should return error for empty username', () => {
      expect(validateUsername('')).toBe('Username is required');
    });

    it('should return error for username less than 3 characters', () => {
      expect(validateUsername('ab')).toBe('Username must be at least 3 characters');
    });

    it('should return error for username with special characters', () => {
      expect(validateUsername('user@name')).toBe('Username can only contain letters, numbers and underscores');
      expect(validateUsername('user-name')).toBe('Username can only contain letters, numbers and underscores');
    });

    it('should return empty string for valid username', () => {
      expect(validateUsername('john_doe123')).toBe('');
      expect(validateUsername('username')).toBe('');
    });
  });

  describe('validateName', () => {
    it('should return error for empty name', () => {
      expect(validateName('')).toBe('Name is required');
    });

    it('should return error for name less than 2 characters', () => {
      expect(validateName('A')).toBe('Name must be at least 2 characters');
    });

    it('should return error for name exceeding 50 characters', () => {
      const longName = 'A'.repeat(51);
      expect(validateName(longName)).toBe('Name cannot exceed 50 characters');
    });

    it('should return empty string for valid name', () => {
      expect(validateName('John')).toBe('');
      expect(validateName('Mary Jane')).toBe('');
    });

    it('should use custom field name in error messages', () => {
      expect(validateName('', 'First Name')).toBe('First Name is required');
      expect(validateName('A', 'Last Name')).toBe('Last Name must be at least 2 characters');
    });
  });
});