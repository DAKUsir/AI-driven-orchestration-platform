const Streak = require("../models/Streak");

// @desc    Get current streak
// @route   GET /api/streaks
// @access  Private
const getStreak = async (req, res) => {
  try {
    let streak = await Streak.findOne({ userId: req.user.id });
    if (!streak) {
      streak = await Streak.create({ userId: req.user.id });
    }
    res.json(streak);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get streak history (last N days)
// @route   GET /api/streaks/history
// @access  Private
const getStreakHistory = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const streak = await Streak.findOne({ userId: req.user.id });
    if (!streak) return res.json({ history: [] });

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const history = streak.streakHistory.filter((h) => h.date >= cutoff);
    res.json({
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      history,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStreak, getStreakHistory };
