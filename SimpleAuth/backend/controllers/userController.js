const asyncHandler = require('express-async-handler');
const userService = require('../services/userService');

/**
 * User Controller - Handles HTTP requests for user-related operations
 */

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json({
      success: true,
      message: 'Kullanıcı kaydı başarılı!',
      ...user
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const user = await userService.loginUser(username, password, role);
    res.status(200).json({
      success: true,
      message: 'Giriş başarılı!',
      ...user
    });
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404);
    throw new Error(error.message);
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Profil güncellendi!',
      ...updatedUser
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};

