const ExternalProfile = require("../models/ExternalProfile");
const Project = require("../models/Project");
const User = require("../models/User");
const {
  syncLeetCode,
  syncGFG,
  fetchGitHubRepo,
  calculateSyncPoints,
} = require("../services/platformSyncService");

// ─── Platform Connection ────────────────────────────────────────────────────

// @desc    Connect external platform profile (save username + first sync)
// @route   POST /api/integrations/connect
// @access  Private
const connectPlatform = async (req, res) => {
  try {
    const { platform, username } = req.body;

    if (!platform || !username) {
      return res
        .status(400)
        .json({ message: "Platform and username are required" });
    }

    // Upsert ExternalProfile
    let profile = await ExternalProfile.findOne({
      userId: req.user.id,
      platform,
    });

    if (profile) {
      profile.username = username;
    } else {
      profile = new ExternalProfile({
        userId: req.user.id,
        platform,
        username,
        profileUrl:
          platform === "LeetCode"
            ? `https://leetcode.com/u/${username}`
            : platform === "GeeksForGeeks"
            ? `https://www.geeksforgeeks.org/user/${username}`
            : "",
      });
    }

    // Also save the username to the User model for quick access
    const user = await User.findById(req.user.id);
    if (platform === "LeetCode") user.leetcodeUsername = username;
    else if (platform === "GeeksForGeeks") user.gfgUsername = username;
    else if (platform === "GitHub") user.githubUsername = username;
    await user.save();

    // Attempt first sync immediately
    try {
      let syncData;
      if (platform === "LeetCode") {
        syncData = await syncLeetCode(username);
      } else if (platform === "GeeksForGeeks") {
        syncData = await syncGFG(username);
      }

      if (syncData) {
        profile.solvedProblems = syncData.totalSolved;
        profile.easySolved = syncData.easySolved;
        profile.mediumSolved = syncData.mediumSolved;
        profile.hardSolved = syncData.hardSolved;
        profile.ranking = syncData.ranking;
        profile.streak = syncData.streak || 0;
        profile.rawData = syncData.rawData;
        profile.lastSynced = Date.now();
      }
    } catch (syncErr) {
      console.error(
        `[Integration] Initial sync failed for ${platform}:`,
        syncErr.message
      );
      // Still save the profile even if sync fails
    }

    await profile.save();

    // Recalculate points
    await recalculatePoints(req.user.id);

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Sync Progress ──────────────────────────────────────────────────────────

// @desc    Sync all connected platforms
// @route   POST /api/integrations/sync
// @access  Private
const syncAllProgress = async (req, res) => {
  try {
    const profiles = await ExternalProfile.find({ userId: req.user.id });

    const results = [];
    const errors = [];

    for (const profile of profiles) {
      try {
        let syncData;
        if (profile.platform === "LeetCode") {
          syncData = await syncLeetCode(profile.username);
        } else if (profile.platform === "GeeksForGeeks") {
          syncData = await syncGFG(profile.username);
        }

        if (syncData) {
          profile.solvedProblems = syncData.totalSolved;
          profile.easySolved = syncData.easySolved;
          profile.mediumSolved = syncData.mediumSolved;
          profile.hardSolved = syncData.hardSolved;
          profile.ranking = syncData.ranking;
          profile.streak = syncData.streak || 0;
          profile.rawData = syncData.rawData;
          profile.lastSynced = Date.now();
          await profile.save();
          results.push(profile);
        }
      } catch (err) {
        errors.push({ platform: profile.platform, error: err.message });
      }
    }

    // Recalculate points
    await recalculatePoints(req.user.id);

    res.json({
      message: "Sync completed",
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync a specific platform
// @route   POST /api/integrations/sync/:platform
// @access  Private
const syncPlatform = async (req, res) => {
  try {
    const { platform } = req.params;

    const profile = await ExternalProfile.findOne({
      userId: req.user.id,
      platform,
    });

    if (!profile) {
      return res
        .status(404)
        .json({ message: `${platform} is not connected` });
    }

    let syncData;
    if (platform === "LeetCode") {
      syncData = await syncLeetCode(profile.username);
    } else if (platform === "GeeksForGeeks") {
      syncData = await syncGFG(profile.username);
    } else {
      return res
        .status(400)
        .json({ message: `Sync not supported for ${platform}` });
    }

    profile.solvedProblems = syncData.totalSolved;
    profile.easySolved = syncData.easySolved;
    profile.mediumSolved = syncData.mediumSolved;
    profile.hardSolved = syncData.hardSolved;
    profile.ranking = syncData.ranking;
    profile.streak = syncData.streak || 0;
    profile.rawData = syncData.rawData;
    profile.lastSynced = Date.now();
    await profile.save();

    // Recalculate points
    await recalculatePoints(req.user.id);

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get Integrations ───────────────────────────────────────────────────────

// @desc    Get all connected integrations for the user
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

// ─── Project Management ─────────────────────────────────────────────────────

// @desc    Add a GitHub/Kaggle project
// @route   POST /api/integrations/projects
// @access  Private
const addProject = async (req, res) => {
  try {
    const { repoUrl, platform } = req.body;

    if (!repoUrl || !platform) {
      return res
        .status(400)
        .json({ message: "repoUrl and platform are required" });
    }

    // Check if project already tracked
    const existing = await Project.findOne({
      userId: req.user.id,
      repoUrl,
    });
    if (existing) {
      return res.status(400).json({ message: "Project already tracked" });
    }

    let metadata = {};
    if (platform === "GitHub") {
      metadata = await fetchGitHubRepo(repoUrl);
    } else {
      // Kaggle — store with basic info, user can edit
      metadata = {
        name: repoUrl.split("/").pop() || "Kaggle Project",
        description: "",
        language: "Python",
        category: "Data Science",
      };
    }

    const project = await Project.create({
      userId: req.user.id,
      platform,
      repoUrl,
      ...metadata,
      lastSynced: Date.now(),
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all projects for the user
// @route   GET /api/integrations/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a tracked project
// @route   DELETE /api/integrations/projects/:id
// @access  Private
const removeProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ message: "Project removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Re-sync a single project's metadata
// @route   POST /api/integrations/projects/:id/sync
// @access  Private
const syncProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.platform === "GitHub") {
      const metadata = await fetchGitHubRepo(project.repoUrl);
      Object.assign(project, metadata);
      project.lastSynced = Date.now();
      await project.save();
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Helper ─────────────────────────────────────────────────────────────────

const recalculatePoints = async (userId) => {
  try {
    const profiles = await ExternalProfile.find({ userId });
    const syncPoints = calculateSyncPoints(profiles);

    const user = await User.findById(userId);
    // Base points + sync points
    let basePoints = 0;
    if (user.onboardingCompleted) basePoints += 50;
    basePoints += (user.streak || 0) * 5;
    basePoints += (user.totalStudyHours || 0) * 2;

    // Total solved from all platforms
    const totalSolved = profiles.reduce(
      (sum, p) => sum + (p.solvedProblems || 0),
      0
    );

    user.points = basePoints + syncPoints;
    user.totalSolved = totalSolved;
    await user.save();
  } catch (err) {
    console.error("[Integration] Points recalculation error:", err.message);
  }
};

module.exports = {
  connectPlatform,
  syncAllProgress,
  syncPlatform,
  getIntegrations,
  addProject,
  getProjects,
  removeProject,
  syncProject,
};
