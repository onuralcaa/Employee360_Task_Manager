const EmployeeProfile = require('../models/employeeProfileModel');

const createEmployeeProfile = async (profileData) => {
  const profile = await EmployeeProfile.create(profileData);
  return profile.populate([
    { path: 'userId', select: 'name surname email' },
    { path: 'department', select: 'name' }
  ]);
};

const getEmployeeProfiles = async (filters = {}) => {
  const profiles = await EmployeeProfile.find(filters)
    .populate('userId', 'name surname email')
    .populate('department', 'name')
    .lean()
    .exec();
  return profiles;
};

const getEmployeeProfileById = async (userId) => {
  const profile = await EmployeeProfile.findOne({ userId })
    .populate('userId', 'name surname email')
    .populate('department', 'name')
    .lean()
    .exec();
  return profile;
};

const updateEmployeeProfile = async (userId, updateData) => {
  const profile = await EmployeeProfile.findOneAndUpdate(
    { userId },
    updateData,
    { new: true, runValidators: true }
  ).populate([
    { path: 'userId', select: 'name surname email' },
    { path: 'department', select: 'name' }
  ]);
  return profile;
};

const addPerformanceReview = async (userId, reviewData) => {
  const profile = await EmployeeProfile.findOneAndUpdate(
    { userId },
    { $push: { performanceReviews: reviewData } },
    { new: true, runValidators: true }
  ).populate([
    { path: 'userId', select: 'name surname email' },
    { path: 'department', select: 'name' },
    { path: 'performanceReviews.reviewerId', select: 'name surname' }
  ]);
  return profile;
};

const addSkill = async (userId, skill) => {
  const profile = await EmployeeProfile.findOneAndUpdate(
    { userId },
    { $addToSet: { skills: skill } },
    { new: true }
  );
  return profile;
};

const addCertification = async (userId, certificationData) => {
  const profile = await EmployeeProfile.findOneAndUpdate(
    { userId },
    { $push: { certifications: certificationData } },
    { new: true, runValidators: true }
  );
  return profile;
};

module.exports = {
  createEmployeeProfile,
  getEmployeeProfiles,
  getEmployeeProfileById,
  updateEmployeeProfile,
  addPerformanceReview,
  addSkill,
  addCertification
};