const express = require('express');
const router = express.Router();
const { updateTaskStatus, verifyTask } = require('../controllers/taskController');
const { verifyToken } = require('../middleware/authMiddleware');
const { assignTask } = require('../controllers/taskController');

// personel kendi task'ini günceller
router.patch("/:id/status", verifyToken, updateTaskStatus);

//Takım lideri task'leri onaylar
router.patch("/:id/verify", verifyToken, verifyTask);


router.post("/:id/assign", verifyToken, assignTask);

module.exports = router;