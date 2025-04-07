const asyncHandler = require('express-async-handler');
const userService = require('../services/userService');
const logger = require('../utils/logger');

/**
 * User Controller - Handles HTTP requests for user-related operations
 */

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    logger.info('User registered successfully', { username: user.username });
    res.status(201).json({
      success: true,
      message: 'Kullanıcı kaydı başarılı!',
      ...user
    });
  } catch (error) {
    logger.error('User registration failed', { error: error.message });
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
    logger.info('User logged in successfully', { username });
    res.status(200).json({
      success: true,
      message: 'Giriş başarılı!',
      ...user
    });
  } catch (error) {
    logger.error('User login failed', { username, error: error.message });
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

// @desc    Assign card ID to user
// @route   POST /api/users/:id/assign-card
// @access  Private (Admin)
const assignCardToUser = asyncHandler(async (req, res) => {
  const { cardId } = req.body;
  
  if (!cardId) {
    res.status(400);
    throw new Error('Kart ID gereklidir');
  }
  
  try {
    const updatedUser = await userService.assignCardToUser(req.params.id, cardId);
    res.status(200).json({
      success: true,
      message: 'Kart başarıyla atandı',
      data: updatedUser
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Update user work schedule
// @route   PUT /api/users/:id/work-schedule
// @access  Private (Admin)
const updateWorkSchedule = asyncHandler(async (req, res) => {
  try {
    const updatedUser = await userService.updateWorkSchedule(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Çalışma programı güncellendi',
      data: updatedUser
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = asyncHandler(async (req, res) => {
  try {
    // Handle optional query parameters
    const filter = {};
    
    if (req.query.department) {
      filter.department = req.query.department;
    }
    
    if (req.query.hasCard === 'true') {
      filter.cardId = { $exists: true, $ne: null };
    } else if (req.query.hasCard === 'false') {
      filter.cardId = { $exists: false };
    }
    
    const users = await userService.getAllUsers(filter);
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Get users by department
// @route   GET /api/users/department/:department
// @access  Private (Admin)
const getUsersByDepartment = asyncHandler(async (req, res) => {
  try {
    const users = await userService.getUsersByDepartment(req.params.department);
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
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
  assignCardToUser,
  updateWorkSchedule,
  getUsers,
  getUsersByDepartment
};

