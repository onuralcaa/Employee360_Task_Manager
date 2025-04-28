const express = require("express");
const router = express.Router();
const { submitMilestone, verifyMilestone } = require("../controllers/milestoneController");
const verifyToken = require("../middleware/authMiddleware");

// Team leader submits milestone
router.patch("/:id/submit", verifyToken, submitMilestone);

// Admin verifies milestone
router.patch("/:id/verify", verifyToken, verifyMilestone);

module.exports = router;