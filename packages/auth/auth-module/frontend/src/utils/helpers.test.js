import { 
  formatDate, 
  validateEmail, 
  validatePassword, 
  validateUsername, 
  validateName,
  storage,
  handleApiError,
  initializeTheme
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

  describe('storage utilities', () => {
    beforeEach(() => {
      localStorage.clear();
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
    });

    it('sets and gets items from localStorage', () => {
      const testData = { name: 'John', age: 30 };
      storage.set('testKey', testData);
      expect(storage.get('testKey')).toEqual(testData);
    });

    it('removes specific item from localStorage', () => {
      storage.set('testKey', 'value');
      storage.remove('testKey');
      expect(storage.get('testKey')).toBeNull();
    });

    it('clears all items from localStorage', () => {
      storage.set('key1', 'value1');
      storage.set('key2', 'value2');
      storage.clear();
      expect(storage.get('key1')).toBeNull();
      expect(storage.get('key2')).toBeNull();
    });

    it('handles invalid JSON when getting item', () => {
      localStorage.setItem('invalidJson', 'invalid{json');
      expect(storage.get('invalidJson')).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('handles storage errors gracefully', () => {
      const mockError = new Error('QuotaExceededError');
      jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw mockError;
      });

      storage.set('key', 'value');
      expect(console.error).toHaveBeenCalledWith('Error writing to localStorage:', mockError);
    });
  });

  describe('validateEmail', () => {
    it('returns error for empty email', () => {
      expect(validateEmail('')).toBe('Email is required');
    });

    it('returns error for invalid email format', () => {
      expect(validateEmail('invalid-email')).toBe('Please enter a valid email address');
      expect(validateEmail('user@')).toBe('Please enter a valid email address');
      expect(validateEmail('@domain.com')).toBe('Please enter a valid email address');
    });

    it('returns empty string for valid email', () => {
      expect(validateEmail('user@domain.com')).toBe('');
      expect(validateEmail('user.name@domain.co.uk')).toBe('');
      expect(validateEmail('user+label@domain.com')).toBe('');
    });
  });

  describe('validatePassword', () => {
    it('returns error for empty password', () => {
      expect(validatePassword('')).toBe('Password is required');
    });

    it('returns error for short password', () => {
      expect(validatePassword('pass')).toBe('Password must be at least 6 characters');
    });

    it('returns error for password without required characters', () => {
      expect(validatePassword('password')).toBe('Password must contain at least one letter and one number');
      expect(validatePassword('12345678')).toBe('Password must contain at least one letter and one number');
    });

    it('returns empty string for valid password', () => {
      expect(validatePassword('Password123')).toBe('');
      expect(validatePassword('securePass1')).toBe('');
      expect(validatePassword('1Complex@Pass')).toBe('');
    });
  });

  describe('validateUsername', () => {
    it('returns error for empty username', () => {
      expect(validateUsername('')).toBe('Username is required');
    });

    it('returns error for short username', () => {
      expect(validateUsername('ab')).toBe('Username must be at least 3 characters');
    });

    it('returns error for invalid characters', () => {
      expect(validateUsername('user@name')).toBe('Username can only contain letters, numbers, and underscores');
    });

    it('returns empty string for valid username', () => {
      expect(validateUsername('john_doe')).toBe('');
      expect(validateUsername('user123')).toBe('');
      expect(validateUsername('JohnDoe')).toBe('');
    });
  });

  describe('validateName', () => {
    it('returns error for empty name', () => {
      expect(validateName('', 'First name')).toBe('First name is required');
    });

    it('returns error for name with numbers or special characters', () => {
      expect(validateName('John2', 'First name')).toBe('First name can only contain letters');
      expect(validateName('John@Doe', 'Last name')).toBe('Last name can only contain letters');
    });

    it('returns empty string for valid name', () => {
      expect(validateName('John', 'First name')).toBe('');
      expect(validateName('OBrien', 'Last name')).toBe('');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2025-04-10');
      expect(formatDate(date)).toMatch(/Apr(il)?\s10,?\s2025/);
    });

    it('handles string date input', () => {
      expect(formatDate('2025-04-10')).toMatch(/Apr(il)?\s10,?\s2025/);
    });

    it('handles invalid date input', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date');
    });
  });

  describe('handleApiError', () => {
    it('extracts message from API error response', () => {
      const error = {
        response: {
          data: {
            message: 'Invalid credentials'
          }
        }
      };
      expect(handleApiError(error)).toBe('Invalid credentials');
    });

    it('falls back to error message if no response data', () => {
      const error = new Error('Network error');
      expect(handleApiError(error)).toBe('Network error');
    });

    it('returns default message if no error details available', () => {
      const error = {};
      expect(handleApiError(error)).toBe('An unexpected error occurred');
    });
  });

  describe('initializeTheme', () => {
    const originalDocumentElement = document.documentElement;
    let mockElement;

    beforeEach(() => {
      mockElement = {
        style: new Map(),
        setProperty: function(key, value) {
          this.style.set(key, value);
        }
      };
      document.documentElement = mockElement;
    });

    afterEach(() => {
      document.documentElement = originalDocumentElement;
    });

    it('sets theme CSS variables', () => {
      initializeTheme();
      expect(mockElement.style.get('--background-color')).toBe('#ffffff');
      expect(mockElement.style.get('--text-primary')).toBe('#212529');
      expect(mockElement.style.get('--primary-color')).toBeTruthy();
    });
  });
});