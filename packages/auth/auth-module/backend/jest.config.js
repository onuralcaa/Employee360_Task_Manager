module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'services/**/*.js',
    'utils/**/*.js',
    '!**/*.test.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleNameMapper: {
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@controllers/(.*)$': '<rootDir>/controllers/$1',
  },
  verbose: true,
  testTimeout: 30000
};