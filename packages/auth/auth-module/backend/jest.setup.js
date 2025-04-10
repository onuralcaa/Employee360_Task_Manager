// Set test environment variables
process.env.JWT_SECRET = 'test-jwt-secret-' + Math.random().toString(36).substring(7);
process.env.NODE_ENV = 'test';

// Increase test timeout
jest.setTimeout(30000);

// Clean up any mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});