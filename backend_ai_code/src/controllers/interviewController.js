const Interview = require("../models/Interview");

// @desc    Start a new mock interview session
// @route   POST /api/interview/start
// @access  Private
const startInterview = async (req, res) => {
  try {
    const { type, difficulty } = req.body;

    const interview = await Interview.create({
      userId: req.user.id,
      type,
      difficulty,
      questions: [], // Will be populated by AI as the interview progresses
      status: "in-progress",
    });

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit interview and get feedback
// @route   POST /api/interview/submit
// @access  Private
const submitInterview = async (req, res) => {
  try {
    const { interviewId, answers, feedback, scores } = req.body;

    const interview = await Interview.findById(interviewId);

    if (interview) {
      if (interview.userId.toString() !== req.user.id) {
        return res.status(401).json({ message: "Not authorized" });
      }

      interview.answers = answers;
      interview.feedback = feedback;
      interview.score = scores.overall;
      interview.technicalScore = scores.technical;
      interview.communicationScore = scores.communication;
      interview.confidenceScore = scores.confidence;
      interview.completedAt = Date.now();

      const updatedInterview = await interview.save();
      res.json(updatedInterview);
    } else {
      res.status(404).json({ message: "Interview session not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get interview history
// @route   GET /api/interview/history
// @access  Private
const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  startInterview,
  submitInterview,
  getInterviewHistory,
};
