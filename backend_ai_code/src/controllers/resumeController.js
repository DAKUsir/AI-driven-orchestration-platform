const Resume = require("../models/Resume");
const aiService = require("../services/aiService");

// @desc    Upload and analyze resume
// @route   POST /api/resume/upload
// @access  Private
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const userId = req.user.id;
    const filePath = req.file.path;

    // TODO: Extract text from PDF/Image (using a library like pdf-parse or AI service)
    // For now, we'll assume the AI service can handle the file or we pass the path
    const extractedText = "Sample extracted text from resume"; 

    // Call AI service for analysis
    const analysis = await aiService.analyzeResume(extractedText, req.body.targetRole);

    const resume = await Resume.create({
      userId,
      originalFile: filePath,
      extractedText,
      atsScore: analysis.atsScore,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      suggestions: analysis.suggestions,
      targetRole: req.body.targetRole || "Software Engineer",
    });

    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get resume history
// @route   GET /api/resume/history
// @access  Private
const getResumeHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadResume,
  getResumeHistory,
};
