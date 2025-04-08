const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { logger, createError } = require('../utils/logger');

const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    logger.warn('JWT_SECRET not set, using default secret');
  }
  return jwt.sign(
    { id, role }, 
    process.env.JWT_SECRET || 'jwt_secret_key',
    { expiresIn: '30d' }
  );
};

const registerUser = async (userData) => {
  const { name, surname, username, email, password, role } = userData;

  try {
    const userExists = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (userExists) {
      throw createError('User already exists', 400);
    }

    if (!password || password.length < 6) {
      throw createError('Password must be at least 6 characters', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      surname,
      username,
      email,
      password: hashedPassword,
      role: role || 'personel'
    });

    return {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    };
  } catch (error) {
    logger.error('Registration error:', { error: error.message });
    throw error;
  }
};

const loginUser = async (username, password) => {
  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      throw createError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError('Invalid credentials', 401);
    }

    return {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    };
  } catch (error) {
    logger.error('Login error:', { error: error.message });
    throw error;
  }
};

const updateUser = async (userId, updateData) => {
  try {
    if (updateData.password) {
      if (updateData.password.length < 6) {
        throw createError('Password must be at least 6 characters', 400);
      }
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      throw createError('User not found', 404);
    }

    return user;
  } catch (error) {
    logger.error('Update error:', { error: error.message });
    throw error;
  }
};

const getUsers = async (filter = {}) => {
  try {
    return await User.find(filter).select('-password');
  } catch (error) {
    logger.error('Get users error:', { error: error.message });
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw createError('User not found', 404);
    }
    return user;
  } catch (error) {
    logger.error('Get user error:', { error: error.message });
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  getUsers,
  getUserById
};