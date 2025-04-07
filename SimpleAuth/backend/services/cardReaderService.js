const CardReader = require('../models/cardReaderModel');

/**
 * Card Reader Service - Handles business logic for card readers
 */

// Register a new card reader
const registerCardReader = async (readerData) => {
  try {
    // Check if device ID already exists
    const existingReader = await CardReader.findOne({ deviceId: readerData.deviceId });
    if (existingReader) {
      throw new Error('Card reader with this device ID already exists');
    }

    // Create new card reader
    const cardReader = await CardReader.create(readerData);
    return cardReader;
  } catch (error) {
    throw error;
  }
};

// Get all card readers
const getAllCardReaders = async (filter = {}) => {
  try {
    const readers = await CardReader.find(filter);
    return readers;
  } catch (error) {
    throw error;
  }
};

// Get card reader by ID
const getCardReaderById = async (id) => {
  try {
    const reader = await CardReader.findById(id);
    if (!reader) {
      throw new Error('Card reader not found');
    }
    return reader;
  } catch (error) {
    throw error;
  }
};

// Update card reader
const updateCardReader = async (id, updateData) => {
  try {
    const reader = await CardReader.findById(id);
    if (!reader) {
      throw new Error('Card reader not found');
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id') { // Prevent _id modification
        reader[key] = updateData[key];
      }
    });

    // Save updates
    const updatedReader = await reader.save();
    return updatedReader;
  } catch (error) {
    throw error;
  }
};

// Update reader status
const updateReaderStatus = async (id, status) => {
  try {
    const reader = await CardReader.findById(id);
    if (!reader) {
      throw new Error('Card reader not found');
    }

    reader.status = status;
    reader.lastPing = new Date();
    const updatedReader = await reader.save();
    return updatedReader;
  } catch (error) {
    throw error;
  }
};

// Log maintenance
const logMaintenance = async (id, maintenanceData) => {
  try {
    const reader = await CardReader.findById(id);
    if (!reader) {
      throw new Error('Card reader not found');
    }

    reader.maintenanceLog.push({
      ...maintenanceData,
      date: new Date()
    });
    
    const updatedReader = await reader.save();
    return updatedReader;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  registerCardReader,
  getAllCardReaders,
  getCardReaderById,
  updateCardReader,
  updateReaderStatus,
  logMaintenance
};