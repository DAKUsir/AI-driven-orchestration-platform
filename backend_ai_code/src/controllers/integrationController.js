const ExternalProfile = require("../models/ExternalProfile");
const aiService = require("../services/aiService");

// @desc    Connect external platform profile
// @route   POST /api/integrations/connect
// @access  Private
const connectPlatform = async (req, res) => {
  try {
    const { platform, username, profileUrl } = req.body;

    let profile = await ExternalProfile.findOne({
      userId: req.user.id,
      platform,
    });

    if (profile) {
      profile.username = username;
      profile.profileUrl = profileUrl;
      await profile.save();
    } else {
      profile = await ExternalProfile.create({
        userId: req.user.id,
        platform,
        username,
        profileUrl,
      });
    }

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync progress from external platforms
// @route   POST /api/integrations/sync
// @access  Private
const syncProgress = async (req, res) => {
  try {
    const profiles = await ExternalProfile.find({ userId: req.user.id });
    
    // In a real app, you would iterate and fetch data for each profile
    // via specialized services or your AI engine.
    // For now, we'll simulate a sync.
    
    const syncResults = await Promise.all(profiles.map(async (profile) => {
      // Simulate fetching data
      profile.solvedProblems += 5;
      profile.lastSynced = Date.now();
      return profile.save();
    }));

    res.json({ message: "Sync successful", results: syncResults });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all connected integrations
// @route   GET /api/integrations
// @access  Private
const getIntegrations = async (req, res) => {
  try {
    const profiles = await ExternalProfile.find({ userId: req.user.id });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  connectPlatform,
  syncProgress,
  getIntegrations,
};
