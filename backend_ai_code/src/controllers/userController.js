const User = require("../models/User");
const { encrypt } = require("../utils/crypto");

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

      // New profile fields
      if (req.body.year !== undefined) user.year = req.body.year;
      if (req.body.department !== undefined) user.department = req.body.department;
      if (req.body.leetcodeUsername !== undefined) user.leetcodeUsername = req.body.leetcodeUsername;
      if (req.body.gfgUsername !== undefined) user.gfgUsername = req.body.gfgUsername;
      if (req.body.githubUsername !== undefined) user.githubUsername = req.body.githubUsername;
      if (req.body.emojiAvatar !== undefined) user.emojiAvatar = req.body.emojiAvatar;

      const updatedUser = await user.save();

      // Return full user (without password)
      const userObj = updatedUser.toObject();
      delete userObj.password;
      res.json(userObj);
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

// @desc    Get public profile of any user (for leaderboard)
// @route   GET /api/users/:id/public-profile
// @access  Private
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name username email avatar emojiAvatar bio college graduationYear targetRole experienceLevel skills weakTopics strongTopics streak longestStreak totalSolved totalStudyHours points leetcodeUsername gfgUsername githubUsername lastActive createdAt")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set user's custom AI Provider API key
// @route   POST /api/users/ai-provider
// @access  Private
const setAiProviderKey = async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ message: "API key is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Encrypt and save the API key
    user.customAiApiKey = encrypt(apiKey);
    await user.save();

    res.json({ message: "AI Provider connected successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserStats,
  getPublicProfile,
  setAiProviderKey,
};
