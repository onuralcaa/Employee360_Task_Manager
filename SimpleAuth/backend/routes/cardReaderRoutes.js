const express = require('express');
const router = express.Router();
const {
  registerCardReader,
  getCardReaders,
  getCardReaderById,
  updateCardReader,
  updateReaderStatus,
  logMaintenance
} = require('../controllers/cardReaderController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * Card Reader Routes
 */

// Admin-only access for all card reader management
router.use(protect, admin);

// Get all readers and register new reader
router.route('/')
  .get(getCardReaders)
  .post(registerCardReader);

// Get, update, and delete specific reader
router.route('/:id')
  .get(getCardReaderById)
  .put(updateCardReader);

// Update reader status
router.patch('/:id/status', updateReaderStatus);

// Log maintenance
router.post('/:id/maintenance', logMaintenance);

module.exports = router;