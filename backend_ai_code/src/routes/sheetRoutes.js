const express = require("express");
const router = express.Router();
const { getSheets, seedSheets } = require("../controllers/sheetController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getSheets);
router.post("/seed", protect, seedSheets);

module.exports = router;
