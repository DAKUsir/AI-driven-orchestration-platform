const express = require("express");
const router = express.Router();
const { getDailyReview, getWeeklyReview } = require("../controllers/dailyReviewController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getDailyReview);
router.get("/weekly", protect, getWeeklyReview);

module.exports = router;
