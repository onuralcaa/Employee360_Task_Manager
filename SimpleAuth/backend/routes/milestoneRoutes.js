const express = require("express");
const router = express.Router();
const { 
  assignMilestone, 
  updateMilestoneStatus, 
  submitMilestone, 
  verifyMilestone, 
  rejectMilestone, 
  getAllMilestones, 
  getMilestonesByUserId, 
  getMilestonesByTeamId,
  createMilestone,
  deleteMilestone
} = require("../controllers/milestoneController");
const verifyToken = require("../middleware/authMiddleware");

// Get all milestones (admin only)
router.get("/", verifyToken, getAllMilestones);

// Get milestones by user ID
router.get("/user/:userId", verifyToken, getMilestonesByUserId);

// Get milestones by team ID
router.get("/team/:teamId", verifyToken, getMilestonesByTeamId);

// Create new milestone (admin only)
router.post("/", verifyToken, (req, res, next) => {
  // Extra middleware to ensure only admins can access this route
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok. Sadece yöneticiler milestone oluşturabilir." });
  }
  next();
}, createMilestone);

// Admin assigns milestone to team leader
router.post("/assign", verifyToken, (req, res, next) => {
  // Extra middleware to ensure only admins can access this route
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok. Sadece yöneticiler milestone atayabilir." });
  }
  next();
}, assignMilestone);

// Update milestone status
router.patch("/:id", verifyToken, updateMilestoneStatus);

// Delete milestone
router.delete("/:id", verifyToken, deleteMilestone);

// Team leader submits milestone
router.patch("/:id/submit", verifyToken, submitMilestone);

// Admin verifies milestone
router.patch("/:id/verify", verifyToken, verifyMilestone);

// Admin rejects milestone
router.patch("/:id/reject", verifyToken, rejectMilestone);

module.exports = router;