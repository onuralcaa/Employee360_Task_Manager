/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  testMatch: ['**/__tests__/**/*.test.jsx'],
  transformIgnorePatterns: [
    '/node_modules/(?!(@testing-library|@babel)/)'
  ]
};