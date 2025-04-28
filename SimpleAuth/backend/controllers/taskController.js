const Task = require('../models/taskModel');
const User = require('../models/userModel');

const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignedTo', 'name email')
            .populate('team', 'name')
            .populate('createdBy', 'name');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const assignTask = async (req, res) => {
    try {
        if (req.user.role !== 'team_leader') {
            return res.status(403).json({ message: "Sadece takım liderleri görev atayabilir." });
        }

        const task = new Task({
            ...req.body,
            createdBy: req.user.id,
            team: req.user.team,
            status: 'todo'
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task._previousStatus = task.status;
        task.status = req.body.status;
        
        if (req.body.status === 'verified' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can verify tasks' });
        }

        await task.save();
        res.json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const verifyTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can verify tasks' });
        }

        task.status = 'verified';
        await task.save();
        res.json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getAllTasks,
    assignTask,
    updateTaskStatus,
    verifyTask
};