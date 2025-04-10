const Task = require('../models/taskModel');

const createTask = async (taskData) => {
  const task = await Task.create(taskData);
  return task.populate([
    { path: 'assignedTo', select: 'name surname' },
    { path: 'assignedBy', select: 'name surname' },
    { path: 'project', select: 'name' }
  ]);
};

const getTasks = async (filters = {}) => {
  const tasks = await Task.find({ ...filters, isArchived: false })
    .populate('assignedTo', 'name surname')
    .populate('assignedBy', 'name surname')
    .populate('project', 'name')
    .sort({ createdAt: -1 })
    .lean()
    .exec();
  return tasks;
};

const getTaskById = async (id) => {
  const task = await Task.findById(id)
    .populate('assignedTo', 'name surname email')
    .populate('assignedBy', 'name surname')
    .populate('project', 'name')
    .populate('comments.createdBy', 'name surname')
    .lean()
    .exec();
  return task;
};

const updateTask = async (id, updateData) => {
  const task = await Task.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate([
    { path: 'assignedTo', select: 'name surname' },
    { path: 'assignedBy', select: 'name surname' },
    { path: 'project', select: 'name' }
  ]);
  return task;
};

const deleteTask = async (id) => {
  const task = await Task.findByIdAndUpdate(
    id,
    { isArchived: true },
    { new: true }
  );
  return task;
};

const addTaskComment = async (taskId, commentData) => {
  const task = await Task.findByIdAndUpdate(
    taskId,
    { $push: { comments: commentData } },
    { new: true, runValidators: true }
  ).populate([
    { path: 'assignedTo', select: 'name surname' },
    { path: 'comments.createdBy', select: 'name surname' }
  ]);
  return task;
};

const getTasksByAssignee = async (userId) => {
  const tasks = await Task.find({ 
    assignedTo: userId, 
    isArchived: false 
  })
    .populate('project', 'name')
    .sort({ dueDate: 1 })
    .lean()
    .exec();
  return tasks;
};

const getTaskStats = async (filters = {}) => {
  const stats = await Task.aggregate([
    { $match: { ...filters, isArchived: false } },
    { 
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      } 
    }
  ]);
  
  // Format stats into an object
  const formattedStats = {
    total: 0,
    pending: 0,
    'in-progress': 0,
    review: 0,
    completed: 0
  };
  
  stats.forEach(stat => {
    formattedStats[stat._id] = stat.count;
    formattedStats.total += stat.count;
  });
  
  return formattedStats;
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addTaskComment,
  getTasksByAssignee,
  getTaskStats
};