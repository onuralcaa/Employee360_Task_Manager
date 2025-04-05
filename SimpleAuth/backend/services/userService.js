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

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  generateToken
};