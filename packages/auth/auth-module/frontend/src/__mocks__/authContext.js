export const mockAuthContext = {
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  isAuthenticated: jest.fn(),
  user: null,
  loading: false,
  error: null,
  clearError: jest.fn()
};