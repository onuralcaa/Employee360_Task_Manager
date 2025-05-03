const express = require("express");
const router = express.Router();
const { createEntry, getAllEntries } = require("../controllers/entryController");

router.post("/", createEntry);        // ESP32 buraya veri gönderiyor
router.get("/", getAllEntries);       // Admin paneli burada verileri görüyor

module.exports = router;
