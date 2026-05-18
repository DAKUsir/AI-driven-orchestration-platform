const express = require("express");
const router = express.Router();
const { getLeaderboard, getUserRank, getGroupLeaderboard } = require("../controllers/leaderboardController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getLeaderboard);
router.get("/me", protect, getUserRank);
router.get("/group/:groupId", protect, getGroupLeaderboard);

module.exports = router;
