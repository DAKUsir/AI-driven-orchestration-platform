const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getStreakInfo,
  syncActivity,
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, getDashboard);
router.get("/streak", protect, getStreakInfo);
router.post("/sync-activity", protect, syncActivity);

module.exports = router;
