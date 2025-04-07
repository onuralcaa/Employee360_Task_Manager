const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Changed from bcryptjs to bcrypt

/**
 * User Service - Handles business logic for user-related operations
 */

// Generate JWT token
const generateToken = (id, role, name, username) => {
  return jwt.sign({ id, role, name, username }, process.env.JWT_SECRET || 'jwt_secret_key', {
    expiresIn: '30d',
  });
};

// Register a new user
const registerUser = async (userData) => {
  const { name, surname, username, email, password, number, birthdate, role } = userData;

  // Check if user already exists
  const userExists = await User.findOne({ username });
  if (userExists) {
    throw new Error('Bu kullanıcı adı zaten alınmış!');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    surname,
    username,
    email,
    password: hashedPassword,
    number,
    birthdate,
    role: role || 'personel',
  });

  if (user) {
    return {
      _id: user._id,
      name: user.name,
      surname: user.surname,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role, user.name, user.username),
    };
  } else {
    throw new Error('Geçersiz kullanıcı verileri');
  }
};

// Login user
const loginUser = async (username, password, role) => {
  // Find user
  const user = await User.findOne({ username });

  if (!user) {
    throw new Error('Kullanıcı bulunamadı');
  }

  // Check if password matches
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Geçersiz kimlik bilgileri');
  }

  // Check if role matches
  if (user.role !== role) {
    throw new Error(`${role === 'admin' ? 'Yönetici' : 'Personel'} girişi yapılamadı`);
  }

  return {
    _id: user._id,
    name: user.name,
    surname: user.surname,
    username: user.username,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role, user.name, user.username),
  };
};

// Get user profile
const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  
  if (!user) {
    throw new Error('Kullanıcı bulunamadı');
  }
  
  return user;
};

// Update user profile
const updateUserProfile = async (userId, userData) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('Kullanıcı bulunamadı');
  }
  
  // Update fields
  user.name = userData.name || user.name;
  user.surname = userData.surname || user.surname;
  user.email = userData.email || user.email;
  user.number = userData.number || user.number;
  
  // Update password if provided
  if (userData.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(userData.password, salt);
  }
  
  const updatedUser = await user.save();
  
  return {
    _id: updatedUser._id,
    name: updatedUser.name,
    surname: updatedUser.surname,
    username: updatedUser.username,
    email: updatedUser.email,
    role: updatedUser.role,
  };
};

// Assign card ID to user
const assignCardToUser = async (userId, cardId) => {
  // Check if card is already assigned to another user
  const existingCard = await User.findOne({ cardId });
  if (existingCard && existingCard._id.toString() !== userId) {
    throw new Error('Bu kart numarası başka bir kullanıcıya atanmış');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('Kullanıcı bulunamadı');
  }

  user.cardId = cardId;
  
  // If not set already, generate an employee ID
  if (!user.employeeId) {
    const prefix = 'EMP';
    const numericPart = String(Math.floor(10000 + Math.random() * 90000));
    user.employeeId = `${prefix}${numericPart}`;
  }
  
  const updatedUser = await user.save();
  
  return {
    _id: updatedUser._id,
    name: updatedUser.name,
    surname: updatedUser.surname,
    username: updatedUser.username,
    cardId: updatedUser.cardId,
    employeeId: updatedUser.employeeId
  };
};

// Update user work schedule
const updateWorkSchedule = async (userId, scheduleData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('Kullanıcı bulunamadı');
  }

  // Validate schedule data
  const { startTime, endTime, workDays } = scheduleData;
  
  // Simple validation for time format (HH:MM)
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (startTime && !timeRegex.test(startTime)) {
    throw new Error('Başlangıç zamanı geçerli bir zaman formatında olmalıdır (HH:MM)');
  }
  
  if (endTime && !timeRegex.test(endTime)) {
    throw new Error('Bitiş zamanı geçerli bir zaman formatında olmalıdır (HH:MM)');
  }
  
  // Update work schedule fields
  user.workSchedule = {
    startTime: startTime || user.workSchedule?.startTime || '09:00',
    endTime: endTime || user.workSchedule?.endTime || '18:00',
    workDays: workDays || user.workSchedule?.workDays || [1, 2, 3, 4, 5] // Default: Mon-Fri
  };
  
  // Update department and position if provided
  if (scheduleData.department) {
    user.department = scheduleData.department;
  }
  
  if (scheduleData.position) {
    user.position = scheduleData.position;
  }
  
  const updatedUser = await user.save();
  
  return {
    _id: updatedUser._id,
    name: updatedUser.name,
    workSchedule: updatedUser.workSchedule,
    department: updatedUser.department,
    position: updatedUser.position
  };
};

// Get all users (admin only)
const getAllUsers = async (filter = {}) => {
  // Select all fields except password
  const users = await User.find(filter).select('-password');
  return users;
};

// Get users by department
const getUsersByDepartment = async (department) => {
  const users = await User.find({ department }).select('-password');
  return users;
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  generateToken,
  assignCardToUser,
  updateWorkSchedule,
  getAllUsers,
  getUsersByDepartment
};