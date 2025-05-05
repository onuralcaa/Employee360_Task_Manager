const express = require("express");
const router = express.Router();
const { createEntry, getAllEntries } = require("../controllers/entryController");

// Kart verilerini kaydet (ESP32 burada POST isteği yapar)
router.post("/", createEntry);

// Tüm girişleri al (frontend buradan çeker)
router.get("/", getAllEntries);

module.exports = router;
