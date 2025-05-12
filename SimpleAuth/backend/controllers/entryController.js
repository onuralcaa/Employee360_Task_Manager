const Entry = require("../models/entryModel");

const createEntry = async (req, res) => {
  try {
    const { uid, name, type } = req.body;

    const newEntry = new Entry({
      uid,
      name,
      type, // gelen type (giris/cikis)
    });

    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({
      message: "Kart girişi kaydedilemedi",
      error: error.message,
    });
  }
};

const getAllEntries = async (req, res) => {
  try {
    const entries = await Entry.find().sort({ createdAt: -1 }); // createdAt kullan
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: "Girişler alınamadı", error: error.message });
  }
};

module.exports = { createEntry, getAllEntries };
