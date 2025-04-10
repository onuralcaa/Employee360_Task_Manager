const Department = require('../models/departmentModel');

const createDepartment = async (departmentData) => {
  const department = await Department.create(departmentData);
  return department;
};

const getDepartments = async () => {
  const departments = await Department.find({ isActive: true })
    .populate('manager', 'name surname email')
    .lean()
    .exec();
  return departments;
};

const getDepartmentById = async (id) => {
  const department = await Department.findById(id)
    .populate('manager', 'name surname email')
    .lean()
    .exec();
  return department;
};

const updateDepartment = async (id, updateData) => {
  const department = await Department.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('manager', 'name surname email');
  return department;
};

const deleteDepartment = async (id) => {
  const department = await Department.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  return department;
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
};