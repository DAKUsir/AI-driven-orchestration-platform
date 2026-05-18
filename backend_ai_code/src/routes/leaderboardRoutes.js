const express = require("express");
const router = express.Router();
const { getLeaderboard, getUserRank } = require("../controllers/leaderboardController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getLeaderboard);
router.get("/me", protect, getUserRank);

module.exports = router;
