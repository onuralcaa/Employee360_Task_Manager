const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const userService = require('../services/userService');
const { handleError } = require('../utils/logger');
const { validateSchema, validateId, validateQueryParams } = require('../middleware/validationMiddleware');
const { registerSchema, loginSchema, updateProfileSchema } = require('../utils/validationSchemas');

// Public routes
router.post('/register', 
  validateSchema(registerSchema),
  async (req, res) => {
    try {
      const user = await userService.registerUser(req.body);
      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(error.status || 400).json(handleError(error));
    }
});

router.post('/login',
  validateSchema(loginSchema),
  async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await userService.loginUser(username, password);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(error.status || 401).json(handleError(error));
    }
});

// Protected routes
router.get('/profile',
  auth(),
  async (req, res) => {
    try {
      const user = await userService.getUserById(req.user.id);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(error.status || 400).json(handleError(error));
    }
});

router.put('/profile',
  auth(),
  validateSchema(updateProfileSchema),
  async (req, res) => {
    try {
      const user = await userService.updateUser(req.user.id, req.body);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(error.status || 400).json(handleError(error));
    }
});

// Add a route for changing passwords
router.put('/profile/password',
  auth(),
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      await userService.changePassword(req.user.id, currentPassword, newPassword);
      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      res.status(error.status || 400).json(handleError(error));
    }
  }
);

// Admin routes
router.get('/users',
  auth('admin'),
  validateQueryParams(['role', 'department', 'isActive']),
  async (req, res) => {
    try {
      const users = await userService.getUsers(req.query);
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(error.status || 400).json(handleError(error));
    }
});

router.get('/users/:id',
  auth('admin'),
  validateId,
  async (req, res) => {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(error.status || 400).json(handleError(error));
    }
});

module.exports = router;
