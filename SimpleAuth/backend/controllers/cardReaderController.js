const asyncHandler = require('express-async-handler');
const cardReaderService = require('../services/cardReaderService');

/**
 * Card Reader Controller - Handles HTTP requests for card reader management
 */

// @desc    Register a new card reader
// @route   POST /api/card-readers
// @access  Private (Admin)
const registerCardReader = asyncHandler(async (req, res) => {
  try {
    const cardReader = await cardReaderService.registerCardReader(req.body);
    res.status(201).json({
      success: true,
      message: 'Kart okuyucu başarıyla kaydedildi',
      data: cardReader
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Get all card readers
// @route   GET /api/card-readers
// @access  Private (Admin)
const getCardReaders = asyncHandler(async (req, res) => {
  try {
    // Handle optional query parameters
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.location) {
      filter['location.name'] = { $regex: req.query.location, $options: 'i' };
    }
    
    const readers = await cardReaderService.getAllCardReaders(filter);
    res.status(200).json({
      success: true,
      count: readers.length,
      data: readers
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Get card reader by ID
// @route   GET /api/card-readers/:id
// @access  Private (Admin)
const getCardReaderById = asyncHandler(async (req, res) => {
  try {
    const reader = await cardReaderService.getCardReaderById(req.params.id);
    res.status(200).json({
      success: true,
      data: reader
    });
  } catch (error) {
    res.status(404);
    throw new Error(error.message);
  }
});

// @desc    Update card reader
// @route   PUT /api/card-readers/:id
// @access  Private (Admin)
const updateCardReader = asyncHandler(async (req, res) => {
  try {
    const updatedReader = await cardReaderService.updateCardReader(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Kart okuyucu başarıyla güncellendi',
      data: updatedReader
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Update card reader status
// @route   PATCH /api/card-readers/:id/status
// @access  Private (Admin)
const updateReaderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!status || !['active', 'inactive', 'maintenance'].includes(status)) {
    res.status(400);
    throw new Error('Geçerli bir durum belirtiniz (active, inactive, maintenance)');
  }
  
  try {
    const updatedReader = await cardReaderService.updateReaderStatus(req.params.id, status);
    res.status(200).json({
      success: true,
      message: `Kart okuyucu durumu '${status}' olarak güncellendi`,
      data: updatedReader
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Log maintenance for a card reader
// @route   POST /api/card-readers/:id/maintenance
// @access  Private (Admin)
const logMaintenance = asyncHandler(async (req, res) => {
  const { type, description, technician } = req.body;
  
  if (!type || !description || !technician) {
    res.status(400);
    throw new Error('Lütfen tip, açıklama ve teknisyen bilgilerini giriniz');
  }
  
  try {
    const updatedReader = await cardReaderService.logMaintenance(req.params.id, {
      type,
      description,
      technician
    });
    
    res.status(200).json({
      success: true,
      message: 'Bakım kaydı başarıyla eklendi',
      data: updatedReader
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  registerCardReader,
  getCardReaders,
  getCardReaderById,
  updateCardReader,
  updateReaderStatus,
  logMaintenance
};