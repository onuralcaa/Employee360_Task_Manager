const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const userService = require('../services/userService');
const { createError } = require('../utils/errorHandler');

// Public routes
router.post('/register', async (req, res, next) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await userService.loginUser(username, password);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.get('/profile', auth(), async (req, res, next) => {
  try {
    const user = await userService.getUser(req.user.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', auth(), async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.user.id, req.body);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Admin routes
router.get('/users', auth('admin'), async (req, res, next) => {
  try {
    const users = await userService.getUsers();
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;