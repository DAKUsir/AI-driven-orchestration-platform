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

    // Find or create chat history for this context
    let chat = await Chat.findOne({ userId, contextType });

    if (!chat) {
      chat = await Chat.create({ userId, contextType, messages: [] });
    }

    // Add user message to history
    chat.messages.push({ role: "user", content: message });

    // Call AI service
    const aiResponse = await aiService.chatWithMentor(chat.messages, contextType);

    // Add AI response to history
    chat.messages.push({ role: "assistant", content: aiResponse.content });
    await chat.save();

    res.json({ response: aiResponse.content, history: chat.messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate AI Roadmap
// @route   POST /api/ai/roadmap
// @access  Private
const handleRoadmapGeneration = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Prepare data for AI
    const userData = {
      targetRole: user.targetRole,
      skills: user.skills,
      experienceLevel: user.experienceLevel,
      dailyStudyHours: user.dailyStudyHours,
    };

    // Call AI service
    const aiRoadmap = await aiService.generateRoadmap(userData);

    // Create Roadmap entry
    const roadmap = await Roadmap.create({
      userId: req.user.id,
      title: aiRoadmap.title || `Roadmap for ${user.targetRole}`,
      role: user.targetRole,
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

    // Update user's current roadmap
    user.currentRoadmap = roadmap._id;
    await user.save();

    res.status(201).json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Debug code with AI
// @route   POST /api/ai/debug
// @access  Private
const handleDebug = async (req, res) => {
  try {
    const { code, language, error } = req.body;
    const debuggingResult = await aiService.debugCode(code, language, error);
    res.json(debuggingResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  handleChat,
  handleRoadmapGeneration,
  handleDebug,
};
