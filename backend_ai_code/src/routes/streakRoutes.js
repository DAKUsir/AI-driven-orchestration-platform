const express = require("express");
const router = express.Router();
const { getStreak, getStreakHistory } = require("../controllers/streakController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getStreak);
router.get("/history", protect, getStreakHistory);

module.exports = router;
