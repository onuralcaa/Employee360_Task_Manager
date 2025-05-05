const Team = require("../models/teamModel");
const User = require("../models/userModel");

async function addMemberToTeam(teamId, userId) {
    await Team.findByIdAndUpdate(
        teamId,
        { $addToSet: { members: userId } }
    );
    await User.findByIdAndUpdate(
        userId,
        { team: teamId }
    );
}