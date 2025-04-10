const asyncHandler = require('express-async-handler');
const userService = require('../services/userService');
const { logger, handleError } = require('../utils/logger');

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    logger.info('User registered successfully', { username: user.username });
    res.status(201).json(user);
  } catch (error) {
    logger.error('User registration failed', { error: error.message });
    res.status(400).json(handleError(error));
  }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userService.loginUser(username, password);
    res.json(user);
  } catch (error) {
    logger.error('Login failed', { error: error.message });
    res.status(401).json(handleError(error));
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user.id);
    res.json(user);
  } catch (error) {
    logger.error('Get profile failed', { error: error.message });
    res.status(404).json(handleError(error));
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    logger.error('Update profile failed', { error: error.message });
    res.status(400).json(handleError(error));
  }
});

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await userService.getUsers(req.query);
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error('Get users failed', { error: error.message });
    res.status(400).json(handleError(error));
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers
};

