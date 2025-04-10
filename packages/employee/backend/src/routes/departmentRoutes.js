const express = require('express');
const router = express.Router();
const departmentService = require('../services/departmentService');

// Create department (Admin only)
router.post('/', async (req, res, next) => {
  try {
    const department = await departmentService.createDepartment(req.body);
    res.status(201).json({
      success: true,
      data: department
    });
  } catch (error) {
    next(error);
  }
});

// Get all departments
router.get('/', async (req, res, next) => {
  try {
    const departments = await departmentService.getDepartments();
    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    next(error);
  }
});

// Get department by ID
router.get('/:id', async (req, res, next) => {
  try {
    const department = await departmentService.getDepartmentById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    next(error);
  }
});

// Update department (Admin only)
router.put('/:id', async (req, res, next) => {
  try {
    const department = await departmentService.updateDepartment(req.params.id, req.body);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    next(error);
  }
});

// Delete department (Admin only)
router.delete('/:id', async (req, res, next) => {
  try {
    const department = await departmentService.deleteDepartment(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;