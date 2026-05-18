const aiService = require("../services/aiService");
const Chat = require("../models/Chat");
const Roadmap = require("../models/Roadmap");
const Task = require("../models/Task");
const User = require("../models/User");

// @desc    Chat with AI mentor
// @route   POST /api/ai/chat
// @access  Private
const handleChat = async (req, res) => {
  try {
    const { message, contextType } = req.body;
    const userId = req.user.id;

    // Default context type to "mentor" if not provided
    const ctx = contextType || "mentor";

    // Find or create chat history for this context
    let chat = await Chat.findOne({ userId, contextType: ctx });

    if (!chat) {
      chat = await Chat.create({ userId, contextType: ctx, messages: [] });
    }

    // Add user message to history
    chat.messages.push({ role: "user", content: message });

    // Keep last 20 messages for context window
    const recentMessages = chat.messages.slice(-20);

    // Call AI service (uses centralized GITHUB_TOKEN)
    const aiResponse = await aiService.chatWithMentor(recentMessages, ctx);

    // Add AI response to history
    const responseContent = aiResponse.content || aiResponse;
    chat.messages.push({ role: "assistant", content: responseContent });

    // Trim history to last 50 messages to prevent unbounded growth
    if (chat.messages.length > 50) {
      chat.messages = chat.messages.slice(-50);
    }

    await chat.save();

    res.json({ response: responseContent, history: chat.messages });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
};

// @desc    Generate AI Roadmap
// @route   POST /api/ai/roadmap
// @access  Private
const handleRoadmapGeneration = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Accept params from request body (roadmap wizard) or fall back to user profile
    const userData = {
      targetRole: req.body.targetRole || user.targetRole || "Software Engineer",
      skills: req.body.skills || user.skills || [],
      experienceLevel: req.body.experienceLevel || user.experienceLevel || "beginner",
      dailyStudyHours: req.body.dailyStudyHours || user.dailyStudyHours || 2,
      specificTrack: req.body.specificTrack || null,
      specificRole: req.body.specificRole || null,
    };

    // Call AI service
    const aiRoadmap = await aiService.generateRoadmap(userData);

    // Create Roadmap entry
    const roadmap = await Roadmap.create({
      userId: req.user.id,
      title: aiRoadmap.title || `Roadmap for ${userData.targetRole}`,
      role: userData.targetRole,
      durationWeeks: aiRoadmap.durationWeeks || 12,
      milestones: aiRoadmap.milestones,
      status: "active",
    });

    // Create Task entries from AI roadmap
    if (aiRoadmap.tasks && aiRoadmap.tasks.length > 0) {
      const taskPromises = aiRoadmap.tasks.map(task =>
        Task.create({
          userId: req.user.id,
          roadmapId: roadmap._id,
          ...task
        })
      );
      await Promise.all(taskPromises);
    }

    // Update user's current roadmap and profile
    user.currentRoadmap = roadmap._id;
    if (userData.targetRole) user.targetRole = userData.targetRole;
    if (userData.experienceLevel) user.experienceLevel = userData.experienceLevel;
    if (userData.skills?.length) user.skills = userData.skills;
    await user.save();

    res.status(201).json(roadmap);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
};

// @desc    Debug code with AI
// @route   POST /api/ai/debug
// @access  Private
const handleDebug = async (req, res) => {
  try {
    const { code, language, error: codeError } = req.body;
    const debuggingResult = await aiService.debugCode(code, language, codeError);
    res.json(debuggingResult);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
};

module.exports = {
  handleChat,
  handleRoadmapGeneration,
  handleDebug,
};
