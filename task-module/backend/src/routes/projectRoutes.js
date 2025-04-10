const express = require('express');
const router = express.Router();
const { auth } = require('@employee360/auth-module-backend');
const projectService = require('../services/projectService');

// Get all projects
router.get('/', async (req, res, next) => {
  try {
    let filters = {};
    
    // Apply filters based on query params
    if (req.query.status) filters.status = req.query.status;
    if (req.query.department) filters.department = req.query.department;
    
    // Non-admin users can only see projects they're part of
    if (req.user.role !== 'admin') {
      filters.$or = [
        { manager: req.user.id },
        { team: req.user.id }
      ];
    }
    
    const projects = await projectService.getProjects(filters);
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
});

// Get project by ID
router.get('/:id', async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is part of this project or is admin
    const isTeamMember = project.team.some(member => member._id.toString() === req.user.id);
    const isManager = project.manager._id.toString() === req.user.id;
    
    if (req.user.role !== 'admin' && !isTeamMember && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this project'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
});

// Create project (Admin only)
router.post('/', auth('admin'), async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body);
    
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
});

// Update project
router.put('/:id', async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is the project manager or admin
    if (req.user.role !== 'admin' && project.manager._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }
    
    // Project managers can update only certain fields
    if (req.user.role !== 'admin') {
      const allowedUpdates = ['status', 'completionPercentage', 'endDate'];
      
      // Filter out any fields that are not in allowedUpdates
      const updateData = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});
      
      // Update the project
      const updatedProject = await projectService.updateProject(req.params.id, updateData);
      
      return res.json({
        success: true,
        data: updatedProject
      });
    }
    
    // Admins can update all fields
    const updatedProject = await projectService.updateProject(req.params.id, req.body);
    
    res.json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    next(error);
  }
});

// Delete project (Admin only)
router.delete('/:id', auth('admin'), async (req, res, next) => {
  try {
    const project = await projectService.deleteProject(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Project archived successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
});

// Add team member to project
router.post('/:id/team', async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is authorized to add team members
    if (req.user.role !== 'admin' && project.manager._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add team members to this project'
      });
    }
    
    const updatedProject = await projectService.addTeamMember(req.params.id, req.body.userId);
    
    res.json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    next(error);
  }
});

// Remove team member from project
router.delete('/:id/team/:userId', async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is authorized to remove team members
    if (req.user.role !== 'admin' && project.manager._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove team members from this project'
      });
    }
    
    const updatedProject = await projectService.removeTeamMember(req.params.id, req.params.userId);
    
    res.json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    next(error);
  }
});

// Get project statistics (Admin only)
router.get('/stats/summary', auth('admin'), async (req, res, next) => {
  try {
    let filters = {};
    
    // Apply filters based on query params
    if (req.query.manager) filters.manager = req.query.manager;
    if (req.query.department) filters.department = req.query.department;
    
    const stats = await projectService.getProjectStats(filters);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;