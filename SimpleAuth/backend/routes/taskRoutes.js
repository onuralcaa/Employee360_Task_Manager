const express = require('express');
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const taskController = require('../controllers/taskController');

// Rotaları tanımla
router.get('/', verifyToken, taskController.getAllTasks);
router.post('/', verifyToken, taskController.assignTask);
router.patch('/:id/status', verifyToken, taskController.updateTaskStatus);
router.patch('/:id/verify', verifyToken, taskController.verifyTask);

module.exports = router;