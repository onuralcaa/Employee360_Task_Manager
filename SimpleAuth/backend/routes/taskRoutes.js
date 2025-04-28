const express = require('express');
const router = express.Router();
const { updateTaskStatus, verifyTasks, assignTask } = require('../controllers/taskController');
const verifyToken = require('../middleware/authMiddleware');

// personel kendi task'ini günceller
router.patch("/:id/status", verifyToken, updateTaskStatus);

//Takım lideri task'leri onaylar
router.patch("/:id/verify", verifyToken, verifyTasks);

router.post("/:id/assign", verifyToken, assignTask);

router.delete("/:id", verifyToken, (req, res) => {
    res.status(200).json({ message: "Task deleted successfully" });
});

module.exports = router;