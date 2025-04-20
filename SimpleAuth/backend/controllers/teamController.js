const Team = require("../models/teamModel");

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

module.exports = {
  getAllTeams,
  getTeamById
};
