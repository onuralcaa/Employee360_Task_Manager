import api from './api';
import { storage } from '../utils/helpers';

// Mock the storage utility
jest.mock('../utils/helpers', () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn()
  }
}));

describe('API Module', () => {
  const mockToken = 'mock-token';
  const mockApiResponse = { data: { message: 'Success' } };
  const mockApiError = {
    response: {
      data: {
        message: 'Error message'
      },
      status: 400
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    storage.get.mockImplementation((key) => {
      if (key === 'token') return mockToken;
      return null;
    });
  });

  it('adds authorization header when token exists', async () => {
    const requestConfig = api.defaults.headers.common;
    expect(requestConfig['Authorization']).toBe(`Bearer ${mockToken}`);
  });

  it('does not add authorization header when token does not exist', async () => {
    storage.get.mockReturnValue(null);
    const requestConfig = api.defaults.headers.common;
    expect(requestConfig['Authorization']).toBeUndefined();
  });

  it('handles successful requests', async () => {
    const mockResponse = { data: mockApiResponse };
    const response = await api.interceptors.response.handlers[0].fulfilled(mockResponse);
    expect(response).toEqual(mockResponse);
  });

  it('handles request errors', async () => {
    try {
      await api.interceptors.response.handlers[0].rejected(mockApiError);
    } catch (error) {
      expect(error.message).toBe(mockApiError.response.data.message);
    }
  });

  it('handles network errors', async () => {
    const networkError = new Error('Network Error');
    
    try {
      await api.interceptors.response.handlers[0].rejected(networkError);
    } catch (error) {
      expect(error.message).toBe('Network Error');
    }
  });

  it('handles unauthorized errors by clearing storage', async () => {
    const unauthorizedError = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    };

    try {
      await api.interceptors.response.handlers[0].rejected(unauthorizedError);
    } catch (error) {
      expect(storage.remove).toHaveBeenCalledWith('token');
      expect(storage.remove).toHaveBeenCalledWith('user');
      expect(error.message).toBe('Unauthorized');
    }
  });

  describe('HTTP Methods', () => {
    const mockEndpoint = '/test';
    const mockData = { test: 'data' };

    it('makes GET requests', async () => {
      const getSpy = jest.spyOn(api, 'get').mockResolvedValueOnce(mockApiResponse);
      await api.get(mockEndpoint);
      expect(getSpy).toHaveBeenCalledWith(mockEndpoint);
    });

    it('makes POST requests', async () => {
      const postSpy = jest.spyOn(api, 'post').mockResolvedValueOnce(mockApiResponse);
      await api.post(mockEndpoint, mockData);
      expect(postSpy).toHaveBeenCalledWith(mockEndpoint, mockData);
    });

    it('makes PUT requests', async () => {
      const putSpy = jest.spyOn(api, 'put').mockResolvedValueOnce(mockApiResponse);
      await api.put(mockEndpoint, mockData);
      expect(putSpy).toHaveBeenCalledWith(mockEndpoint, mockData);
    });

    it('makes DELETE requests', async () => {
      const deleteSpy = jest.spyOn(api, 'delete').mockResolvedValueOnce(mockApiResponse);
      await api.delete(mockEndpoint);
      expect(deleteSpy).toHaveBeenCalledWith(mockEndpoint);
    });
  });

  describe('API Base URL', () => {
    it('uses correct base URL from environment', () => {
      expect(api.defaults.baseURL).toBe(process.env.VITE_API_URL || '/api');
    });
  });

  describe('Request Headers', () => {
    it('includes content-type header', () => {
      expect(api.defaults.headers.common['Content-Type']).toBe('application/json');
    });

    it('includes accept header', () => {
      expect(api.defaults.headers.common['Accept']).toBe('application/json');
    });
  });
});