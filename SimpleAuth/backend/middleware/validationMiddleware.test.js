const { validateSchema } = require('./validationMiddleware');
const { registerSchema } = require('../utils/validationSchemas');

describe('Validation Middleware', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  describe('User Registration Validation', () => {
    it('passes validation with valid user data', () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test',
        surname: 'User'
      };

      validateSchema(registerSchema)(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('fails validation with missing required fields', () => {
      mockRequest.body = {
        username: 'testuser'
      };

      validateSchema(registerSchema)(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: expect.any(String),
              message: expect.any(String)
            })
          ])
        })
      );
    });

    it('fails validation with invalid email format', () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'Password123',
        name: 'Test',
        surname: 'User'
      };

      validateSchema(registerSchema)(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              message: expect.stringContaining('valid email')
            })
          ])
        })
      );
    });

    it('fails validation with short password', () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'short',
        name: 'Test',
        surname: 'User'
      };

      validateSchema(registerSchema)(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'password',
              message: expect.stringContaining('at least 6 characters')
            })
          ])
        })
      );
    });

    it('fails validation with invalid username format', () => {
      mockRequest.body = {
        username: 'test@user',
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test',
        surname: 'User'
      };

      validateSchema(registerSchema)(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'username',
              message: expect.stringContaining('letters, numbers and underscores')
            })
          ])
        })
      );
    });
  });

  describe('Optional Fields Validation', () => {
    it('passes validation with optional fields', () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test',
        surname: 'User',
        department: 'Engineering',
        position: 'Developer'
      };

      validateSchema(registerSchema)(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('passes validation without optional fields', () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test',
        surname: 'User'
      };

      validateSchema(registerSchema)(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('fails validation with invalid optional field format', () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        name: 'T', // Too short
        surname: 'User'
      };

      validateSchema(registerSchema)(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
              message: expect.stringContaining('at least 2 characters')
            })
          ])
        })
      );
    });
  });

  describe('Error Response Format', () => {
    it('returns properly formatted error response', () => {
      mockRequest.body = {};

      validateSchema(registerSchema)(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: expect.any(String),
              message: expect.any(String)
            })
          ])
        })
      );
    });

    it('includes all validation errors in response', () => {
      mockRequest.body = {
        username: '@invalid',
        email: 'invalid-email',
        password: 'short'
      };

      validateSchema(registerSchema)(mockRequest, mockResponse, nextFunction);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.errors.length).toBeGreaterThan(1);
      expect(response.errors.map(e => e.field)).toEqual(
        expect.arrayContaining(['username', 'email', 'password', 'name', 'surname'])
      );
    });
  });
});