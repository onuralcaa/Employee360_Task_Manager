const Project = require('../models/projectModel');

const createProject = async (projectData) => {
  const project = await Project.create(projectData);
  return project.populate([
    { path: 'manager', select: 'name surname email' },
    { path: 'team', select: 'name surname' },
    { path: 'department', select: 'name' }
  ]);
};

const getProjects = async (filters = {}) => {
  const projects = await Project.find({ ...filters, isArchived: false })
    .populate('manager', 'name surname email')
    .populate('team', 'name surname')
    .populate('department', 'name')
    .sort({ createdAt: -1 })
    .lean()
    .exec();
  return projects;
};

const getProjectById = async (id) => {
  const project = await Project.findById(id)
    .populate('manager', 'name surname email')
    .populate('team', 'name surname')
    .populate('department', 'name')
    .populate({
      path: 'tasks',
      match: { isArchived: false },
      select: 'title status priority dueDate assignedTo',
      populate: { path: 'assignedTo', select: 'name surname' }
    })
    .lean()
    .exec();
  return project;
};

const updateProject = async (id, updateData) => {
  const project = await Project.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate([
    { path: 'manager', select: 'name surname email' },
    { path: 'team', select: 'name surname' },
    { path: 'department', select: 'name' }
  ]);
  return project;
};

const deleteProject = async (id) => {
  const project = await Project.findByIdAndUpdate(
    id,
    { isArchived: true },
    { new: true }
  );
  return project;
};

const addTeamMember = async (projectId, userId) => {
  const project = await Project.findByIdAndUpdate(
    projectId,
    { $addToSet: { team: userId } },
    { new: true }
  ).populate([
    { path: 'manager', select: 'name surname email' },
    { path: 'team', select: 'name surname' },
    { path: 'department', select: 'name' }
  ]);
  return project;
};

const removeTeamMember = async (projectId, userId) => {
  const project = await Project.findByIdAndUpdate(
    projectId,
    { $pull: { team: userId } },
    { new: true }
  ).populate([
    { path: 'manager', select: 'name surname email' },
    { path: 'team', select: 'name surname' },
    { path: 'department', select: 'name' }
  ]);
  return project;
};

const getProjectStats = async (filters = {}) => {
  const stats = await Project.aggregate([
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
    planning: 0,
    active: 0,
    'on-hold': 0,
    completed: 0
  };
  
  stats.forEach(stat => {
    formattedStats[stat._id] = stat.count;
    formattedStats.total += stat.count;
  });
  
  return formattedStats;
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  getProjectStats
};