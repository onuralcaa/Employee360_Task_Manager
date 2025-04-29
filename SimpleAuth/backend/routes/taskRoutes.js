const express = require('express');
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const taskController = require('../controllers/taskController');

// Define routes
router.get('/', verifyToken, taskController.getAllTasks);
router.get('/user/:userId', verifyToken, taskController.getTasksByUserId);
router.post('/', verifyToken, taskController.createTask);
router.patch('/:id', verifyToken, taskController.updateTaskStatus);

module.exports = router;