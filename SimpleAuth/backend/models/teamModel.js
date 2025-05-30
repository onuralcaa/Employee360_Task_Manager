const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false  // ❗ Bunu false yapıyoruz
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ]
});

module.exports = mongoose.model("Team", teamSchema);
