const express = require("express");
const router = express.Router();
const { getAllTeams, getTeamById } = require("../controllers/teamController");

// Route: /api/teams
router.get("/", getAllTeams);            // tüm takımlar
router.get("/:id", getTeamById);         // 👈 belirli takım

module.exports = router;
