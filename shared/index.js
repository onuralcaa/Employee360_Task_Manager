/**
 * Exports all shared utilities for Employee360 Task Manager
 */

const logger = require('./utils/logger');
const validation = require('./utils/validation');
const errors = require('./utils/errors');

module.exports = {
  logger,
  validation,
  errors
};