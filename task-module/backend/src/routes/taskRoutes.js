const express = require('express');
const router = express.Router();
const { auth } = require('@employee360/auth-module-backend');
const taskService = require('../services/taskService');

// Get all tasks
router.get('/', async (req, res, next) => {
  try {
    let filters = {};
    
    // Apply filters based on query params
    if (req.query.status) filters.status = req.query.status;
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.query.project) filters.project = req.query.project;
    
    // If not admin, only show tasks assigned to this user
    if (req.user.role !== 'admin') {
      filters.assignedTo = req.user.id;
    } else if (req.query.assignedTo) {
      // Admins can filter by assignee
      filters.assignedTo = req.query.assignedTo;
    }
    
    const tasks = await taskService.getTasks(filters);
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

// Get task by ID
router.get('/:id', async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Check if user is assigned to this task or is admin
    if (req.user.role !== 'admin' && 
        task.assignedTo._id.toString() !== req.user.id &&
        task.assignedBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this task'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

// Create task (Admin or manager only)
router.post('/', auth('admin'), async (req, res, next) => {
  try {
    // Set the current user as the one assigning the task
    const taskData = {
      ...req.body,
      assignedBy: req.user.id
    };
    
    const task = await taskService.createTask(taskData);
    
    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

// Update task
router.put('/:id', async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Check if user is authorized to update this task
    if (req.user.role !== 'admin' && 
        task.assignedTo._id.toString() !== req.user.id &&
        task.assignedBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }
    
    // Regular employees can update only certain fields
    if (req.user.role !== 'admin') {
      const allowedUpdates = ['status', 'comments'];
      
      // Filter out any fields that are not in allowedUpdates
      const updateData = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});
        
      // If task is being marked as completed, add completedAt date
      if (req.body.status === 'completed' && task.status !== 'completed') {
        updateData.completedAt = new Date();
      }
      
      // Update the task
      const updatedTask = await taskService.updateTask(req.params.id, updateData);
      
      return res.json({
        success: true,
        data: updatedTask
      });
    }
    
    // Admins can update all fields
    const updatedTask = await taskService.updateTask(req.params.id, req.body);
    
    res.json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
});

// Delete task (Admin only)
router.delete('/:id', auth('admin'), async (req, res, next) => {
  try {
    const task = await taskService.deleteTask(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Task archived successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
});

// Add comment to task
router.post('/:id/comments', async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Check if user is authorized to comment on this task
    if (req.user.role !== 'admin' && 
        task.assignedTo._id.toString() !== req.user.id &&
        task.assignedBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this task'
      });
    }
    
    const commentData = {
      text: req.body.text,
      createdBy: req.user.id,
      createdAt: new Date()
    };
    
    const updatedTask = await taskService.addTaskComment(req.params.id, commentData);
    
    res.json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
});

// Get task statistics (Admin only)
router.get('/stats/summary', auth('admin'), async (req, res, next) => {
  try {
    let filters = {};
    
    // Apply filters based on query params
    if (req.query.assignedTo) filters.assignedTo = req.query.assignedTo;
    if (req.query.project) filters.project = req.query.project;
    
    const stats = await taskService.getTaskStats(filters);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;