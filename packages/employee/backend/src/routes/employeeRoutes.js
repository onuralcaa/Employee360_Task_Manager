const express = require('express');
const router = express.Router();
const { auth } = require('@employee360/auth-module-backend');
const employeeService = require('../services/employeeService');

// Get all employee profiles (Admin only)
router.get('/', auth('admin'), async (req, res, next) => {
  try {
    const profiles = await employeeService.getEmployeeProfiles();
    res.json({
      success: true,
      data: profiles
    });
  } catch (error) {
    next(error);
  }
});

// Get employee profile by user ID
router.get('/:userId', async (req, res, next) => {
  try {
    const profile = await employeeService.getEmployeeProfileById(req.params.userId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }
    
    // Check if user is requesting their own profile or is an admin
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this profile'
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
});

// Create employee profile (Admin only)
router.post('/', auth('admin'), async (req, res, next) => {
  try {
    const profile = await employeeService.createEmployeeProfile(req.body);
    res.status(201).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
});

// Update employee profile
router.put('/:userId', async (req, res, next) => {
  try {
    // Check if user is updating their own profile or is an admin
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const profile = await employeeService.updateEmployeeProfile(req.params.userId, req.body);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
});

// Add performance review (Admin only)
router.post('/:userId/reviews', auth('admin'), async (req, res, next) => {
  try {
    const profile = await employeeService.addPerformanceReview(req.params.userId, {
      ...req.body,
      reviewerId: req.user.id,
      date: new Date()
    });
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
});

// Add skill to employee profile
router.post('/:userId/skills', async (req, res, next) => {
  try {
    // Check if user is updating their own profile or is an admin
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const profile = await employeeService.addSkill(req.params.userId, req.body.skill);
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
});

// Add certification to employee profile
router.post('/:userId/certifications', async (req, res, next) => {
  try {
    // Check if user is updating their own profile or is an admin
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const profile = await employeeService.addCertification(req.params.userId, req.body);
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;