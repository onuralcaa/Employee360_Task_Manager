const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { createError } = require('../utils/errorHandler');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'jwt_secret_key',
    { expiresIn: '30d' }
  );
};

const registerUser = async (userData) => {
  try {
    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = await User.create({
      ...userData,
      password: hashedPassword
    });

    const token = generateToken(user._id, user.role);

    return {
      token,
      user: user.toJSON()
    };
  } catch (error) {
    throw error;
  }
};

const loginUser = async (username, password) => {
  try {
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      throw createError('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw createError('Invalid credentials', 401);
    }

    const token = generateToken(user._id, user.role);

    return {
      token,
      user: user.toJSON()
    };
  } catch (error) {
    throw error;
  }
};

const updateUser = async (userId, updateData) => {
  try {
    // If password is being updated, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw createError('User not found', 404);
    }

    return user;
  } catch (error) {
    throw error;
  }
};

const getUsers = async () => {
  try {
    const users = await User.find({ isActive: true })
      .select('-password')
      .lean()
      .exec();
      
    return users;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  getUsers
};