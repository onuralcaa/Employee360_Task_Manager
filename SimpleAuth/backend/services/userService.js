const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Changed from bcryptjs to bcrypt
const logger = require('../utils/logger'); // Added logger
const { ErrorHandler } = require('../utils/logger'); // Added centralized error handling utility

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

  try {
    if (!password || password.trim() === '') {
      logger.error('Password validation failed: Password is empty or undefined', { username });
      throw new Error('Password cannot be empty');
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      logger.warn('Attempt to register with an existing username', { username });
      throw new Error('Username already taken!');
    }

    // Hash password before storing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      surname,
      username,
      email,
      password: hashedPassword, // Store hashed password
      number,
      birthdate,
      role: role || 'personel',
    });

    if (user) {
      logger.info('User created successfully', { username });
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
      throw new Error('Invalid user data');
    }
  } catch (error) {
    logger.error('Error during user registration', { username, error: error.message });
    ErrorHandler.logError(error);
    throw new Error(ErrorHandler.formatError(error).message);
  }
};

// Login user
const loginUser = async (username, password, role) => {
  logger.info('Login attempt', { username, role });

  try {
    const user = await User.findOne({ username });
    if (!user) {
      logger.warn('User not found during login', { username });
      throw new Error('User not found');
    }

    // Use bcrypt to compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('Invalid password attempt', { username });
      throw new Error('Invalid credentials');
    }

    if (user.role !== role) {
      logger.warn('Role mismatch during login', { username, expectedRole: user.role, providedRole: role });
      throw new Error(`${role === 'admin' ? 'Admin' : 'Personnel'} login failed`);
    }

    logger.info('User authenticated successfully', { username });
    return {
      _id: user._id,
      name: user.name,
      surname: user.surname,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role, user.name, user.username),
    };
  } catch (error) {
    ErrorHandler.logError(error);
    throw new Error(ErrorHandler.formatError(error).message);
  }
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
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }
    
    // Update fields
    user.name = userData.name || user.name;
    user.surname = userData.surname || user.surname;
    user.email = userData.email || user.email;
    user.number = userData.number || user.number;
    
    // Update password if provided, with proper hashing
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
  } catch (error) {
    ErrorHandler.logError(error);
    throw new Error(ErrorHandler.formatError(error).message);
  }
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