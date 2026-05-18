const analyticsService = require("../services/analyticsService");
const User = require("../models/User");
const Roadmap = require("../models/Roadmap");

// @desc    Get dashboard stats
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const stats = await analyticsService.getDashboardStats(req.user.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get streak info
// @route   GET /api/analytics/streak
// @access  Private
const getStreakInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("streak longestStreak lastActive");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user activity and streak
// @route   POST /api/analytics/sync-activity
// @access  Private
const syncActivity = async (req, res) => {
  try {
    const newStreak = await analyticsService.updateStreak(req.user.id);
    res.json({ streak: newStreak });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboard,
  getStreakInfo,
  syncActivity,
};
