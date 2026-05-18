const User = require("../models/User");

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PATCH /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.username = req.body.username || user.username;
      user.bio = req.body.bio || user.bio;
      user.college = req.body.college || user.college;
      user.graduationYear = req.body.graduationYear || user.graduationYear;
      user.targetRole = req.body.targetRole || user.targetRole;
      user.experienceLevel = req.body.experienceLevel || user.experienceLevel;
      user.dailyStudyHours = req.body.dailyStudyHours || user.dailyStudyHours;
      user.skills = req.body.skills || user.skills;
      user.weakTopics = req.body.weakTopics || user.weakTopics;
      user.strongTopics = req.body.strongTopics || user.strongTopics;
      user.onboardingCompleted = req.body.onboardingCompleted !== undefined ? req.body.onboardingCompleted : user.onboardingCompleted;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        onboardingCompleted: updatedUser.onboardingCompleted,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("streak longestStreak totalSolved totalStudyHours");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserStats,
};
