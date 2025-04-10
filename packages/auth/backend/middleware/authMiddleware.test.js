const jwt = require('jsonwebtoken');
const { auth } = require('./authMiddleware');
const User = require('../models/userModel');
const mongoose = require('mongoose');

describe('Auth Middleware', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  const executeMiddleware = async (middleware) => {
    try {
      await middleware(mockRequest, mockResponse, nextFunction);
    } catch (error) {
      mockResponse.status(error.status || 500).json({
        message: error.message
      });
    }
  };

  it('should throw error if no token is provided', async () => {
    await executeMiddleware(auth());

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Not authorized, no token'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should throw error for invalid token', async () => {
    mockRequest.headers.authorization = 'Bearer invalid_token';

    await executeMiddleware(auth());

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid token'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should set req.user and call next() for valid token', async () => {
    const user = {
      _id: new mongoose.Types.ObjectId(),
      username: 'testuser',
      email: 'test@example.com',
      role: 'user'
    };

    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(user)
    });

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'jwt_secret_key'
    );
    mockRequest.headers.authorization = `Bearer ${token}`;
    
    await executeMiddleware(auth());

    expect(mockRequest.user).toEqual(user);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('should throw error if user no longer exists', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    const token = jwt.sign(
      { id: userId, role: 'user' }, 
      process.env.JWT_SECRET || 'jwt_secret_key'
    );
    mockRequest.headers.authorization = `Bearer ${token}`;
    
    await executeMiddleware(auth());

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'User not found'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should throw error for insufficient permissions', async () => {
    const user = {
      _id: new mongoose.Types.ObjectId(),
      username: 'testuser',
      email: 'test@example.com',
      role: 'user'
    };

    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(user)
    });

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'jwt_secret_key'
    );
    mockRequest.headers.authorization = `Bearer ${token}`;
    
    await executeMiddleware(auth('admin'));

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Not authorized, insufficient permissions'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});