const User = require("../models/User");
const Roadmap = require("../models/Roadmap");
const Task = require("../models/Task");

/**
 * Calculate and update user streak
 */
const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  const now = new Date();
  const lastActive = new Date(user.lastActive);
  
  // Calculate difference in days
  const diffTime = Math.abs(now - lastActive);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already active today, no change
  } else if (diffDays === 1) {
    // Active yesterday, increment streak
    user.streak += 1;
    if (user.streak > user.longestStreak) {
      user.longestStreak = user.streak;
    }
  } else {
    // Missed a day or more, reset streak
    user.streak = 1;
  }

  user.lastActive = now;
  await user.save();
  return user.streak;
};

/**
 * Update roadmap completion percentage
 */
const updateRoadmapProgress = async (roadmapId) => {
  const totalTasks = await Task.countDocuments({ roadmapId });
  const completedTasks = await Task.countDocuments({ roadmapId, completed: true });

  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  await Roadmap.findByIdAndUpdate(roadmapId, { completionPercentage: percentage });
  return percentage;
};

/**
 * Get aggregated dashboard data
 */
const getDashboardStats = async (userId) => {
  const user = await User.findById(userId).select("-password");
  const activeRoadmap = await Roadmap.findOne({ userId, status: "active" });
  
  const recentTasks = await Task.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(5);

  const stats = {
    user,
    activeRoadmap,
    recentTasks,
    totalSolved: user.totalSolved,
    streak: user.streak,
    totalStudyHours: user.totalStudyHours,
  };

  return stats;
};

module.exports = {
  updateStreak,
  updateRoadmapProgress,
  getDashboardStats,
};
