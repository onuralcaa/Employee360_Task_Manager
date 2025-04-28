const express = require("express");
const router = express.Router();
const { getAllTeams, getTeamById, getAllTeamsWithMembersAndTasks } = require("../controllers/teamController");

// Route: /api/teams
router.get("/", getAllTeams);            // tüm takımlar
router.get("/:id", getTeamById);         // 👈 belirli takım

// Admin: Get all teams with members and tasks
router.get("/full", verifyToken, getAllTeamsWithMembersAndTasks);

module.exports = router;
