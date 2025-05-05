const Team = require("../models/teamModel");
const User = require("../models/userModel");
const Task = require("../models/taskModel");

// ✅ Tüm takımları getir
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find({});
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: "Takımlar alınamadı", error });
  }
};

// ✅ Belirli bir takımı ID ile getir
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Takım bulunamadı" });
    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ message: "Takım bilgisi alınamadı", error });
  }
};

// Admin: Get all teams with members and their tasks
async function getAllTeamsWithMembersAndTasks(req, res) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Sadece adminler görebilir." });
  }

  try {
    const teams = await Team.find({})
      .populate({
        path: "leader",
        select: "name surname username email"
      })
      .populate({
        path: "members",
        select: "name surname username email"
      });

    // For each team, get tasks
    const teamsWithTasks = await Promise.all(
      teams.map(async (team) => {
        const tasks = await Task.find({ team: team._id });
        return {
          ...team.toObject(),
          tasks
        };
      })
    );

    res.json(teamsWithTasks);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası.", error: err });
  }
}

module.exports = {
  getAllTeams,
  getTeamById,
  getAllTeamsWithMembersAndTasks,
};
