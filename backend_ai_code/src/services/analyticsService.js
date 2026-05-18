const User = require("../models/User");
const Roadmap = require("../models/Roadmap");
const Task = require("../models/Task");
const ExternalProfile = require("../models/ExternalProfile");
const Interview = require("../models/Interview");

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
  const completedTasks = await Task.countDocuments({
    roadmapId,
    completed: true,
  });

  const percentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  await Roadmap.findByIdAndUpdate(roadmapId, {
    completionPercentage: percentage,
  });
  return percentage;
};

/**
 * Get aggregated dashboard data with REAL analytics
 */
const getDashboardStats = async (userId) => {
  const user = await User.findById(userId).select("-password");
  const activeRoadmap = await Roadmap.findOne({ userId, status: "active" });
  const externalProfiles = await ExternalProfile.find({ userId });

  // Recent tasks
  const recentTasks = await Task.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(5);

  // Task stats
  const totalTasks = await Task.countDocuments({ userId });
  const completedTasks = await Task.countDocuments({
    userId,
    completed: true,
  });

  // Platform stats breakdown
  const platformStats = {};
  for (const profile of externalProfiles) {
    platformStats[profile.platform] = {
      username: profile.username,
      totalSolved: profile.solvedProblems || 0,
      easySolved: profile.easySolved || 0,
      mediumSolved: profile.mediumSolved || 0,
      hardSolved: profile.hardSolved || 0,
      ranking: profile.ranking || "N/A",
      streak: profile.streak || 0,
      lastSynced: profile.lastSynced,
    };
  }

  // Build skills radar from user's skills + external data
  const skills = buildSkillsRadar(user, externalProfiles);

  // Build difficulty distribution (pie chart data)
  const difficultyDistribution = buildDifficultyDistribution(externalProfiles);

  // Build platform comparison
  const platformComparison = externalProfiles.map((p) => ({
    platform: p.platform,
    solved: p.solvedProblems || 0,
    easy: p.easySolved || 0,
    medium: p.mediumSolved || 0,
    hard: p.hardSolved || 0,
  }));

  // Interview stats
  let interviewStats = { total: 0, avgScore: 0 };
  try {
    const interviews = await Interview.find({ userId });
    if (interviews.length > 0) {
      const totalScore = interviews.reduce(
        (sum, iv) => sum + (iv.score || 0),
        0
      );
      interviewStats = {
        total: interviews.length,
        avgScore: Math.round(totalScore / interviews.length),
      };
    }
  } catch {}

  const stats = {
    user,
    activeRoadmap,
    recentTasks,
    totalSolved: user.totalSolved || 0,
    streak: user.streak || 0,
    longestStreak: user.longestStreak || 0,
    totalStudyHours: user.totalStudyHours || 0,
    points: user.points || 0,
    totalTasks,
    completedTasks,
    platformStats,
    skills,
    difficultyDistribution,
    platformComparison,
    interviewStats,
  };

  return stats;
};

/**
 * Build skills radar data from user skills + platform data
 */
const buildSkillsRadar = (user, profiles) => {
  // Build from user's strong/weak topics and platform data
  const skillMap = {};

  // From user skills
  if (user.skills && user.skills.length > 0) {
    user.skills.forEach((skill) => {
      skillMap[skill] = { name: skill, score: 60 };
    });
  }

  // From strong topics (boost score)
  if (user.strongTopics && user.strongTopics.length > 0) {
    user.strongTopics.forEach((topic) => {
      if (skillMap[topic]) skillMap[topic].score = 85;
      else skillMap[topic] = { name: topic, score: 85 };
    });
  }

  // From weak topics (lower score)
  if (user.weakTopics && user.weakTopics.length > 0) {
    user.weakTopics.forEach((topic) => {
      if (skillMap[topic]) skillMap[topic].score = 35;
      else skillMap[topic] = { name: topic, score: 35 };
    });
  }

  // Derive from platform data
  for (const profile of profiles) {
    const total = profile.solvedProblems || 0;
    if (total > 0) {
      const hardRatio =
        total > 0 ? ((profile.hardSolved || 0) / total) * 100 : 0;
      const mediumRatio =
        total > 0 ? ((profile.mediumSolved || 0) / total) * 100 : 0;

      skillMap["Problem Solving"] = {
        name: "Problem Solving",
        score: Math.min(Math.round(total / 3), 100),
      };
      skillMap["Hard Problems"] = {
        name: "Hard Problems",
        score: Math.min(Math.round(hardRatio * 2.5), 100),
      };
      skillMap["Consistency"] = {
        name: "Consistency",
        score: Math.min((profile.streak || 0) * 5, 100),
      };
    }
  }

  const result = Object.values(skillMap);
  // If no data at all, return placeholder
  if (result.length === 0) {
    return [
      { name: "Problem Solving", score: 0 },
      { name: "Algorithms", score: 0 },
      { name: "Data Structures", score: 0 },
      { name: "System Design", score: 0 },
      { name: "Consistency", score: 0 },
    ];
  }

  return result;
};

/**
 * Build difficulty distribution from external profiles
 */
const buildDifficultyDistribution = (profiles) => {
  let easy = 0,
    medium = 0,
    hard = 0;
  for (const p of profiles) {
    easy += p.easySolved || 0;
    medium += p.mediumSolved || 0;
    hard += p.hardSolved || 0;
  }
  return [
    { name: "Easy", value: easy, color: "#10b981" },
    { name: "Medium", value: medium, color: "#f59e0b" },
    { name: "Hard", value: hard, color: "#ef4444" },
  ];
};

module.exports = {
  updateStreak,
  updateRoadmapProgress,
  getDashboardStats,
};
