const Entry = require("../models/entryModel");

const createEntry = async (req, res) => {
  try {
    const { uid, name } = req.body;
    // Mevcut giriş kaydı
    const newEntry = new Entry({
      uid,
      name,
      createdAt: new Date()  // 🛠 burada tarih oluşturuluyor
    });

    await newEntry.save();
    res.status(201).json({ message: "Giriş kaydedildi" });
  } catch (error) {
    res.status(500).json({ message: "Hata oluştu", error });
  }
};

const getAllEntries = async (req, res) => {
  try {
    const entries = await Entry.find().sort({ time: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: "Veriler alınamadı", error });
  }
};

module.exports = { createEntry, getAllEntries };
