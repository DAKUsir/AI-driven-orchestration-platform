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

    // Step 1: Parse the resume via Gradio space
    const parsed = await aiService.processResume(filePath);
    const extractedText = parsed.parsedText || "";

    // Step 2: Analyse the parsed resume
    const analysis = await aiService.analyzeResume(
      extractedText,
      req.body.jobDescription || "",
      !!req.body.jobDescription,
    );

    const resume = await Resume.create({
      userId,
      originalFile: filePath,
      extractedText,
      analysisMarkdown: analysis.analysis || "",
      targetRole: req.body.targetRole || "Software Engineer",
    });

    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Analyze resume text directly (no file upload)
// @route   POST /api/resume/analyze
// @access  Private
const analyzeResumeText = async (req, res) => {
  try {
    const { resumeText, jobDescription, withJobDescription, temperature, maxTokens } = req.body;

    if (!resumeText) {
      return res.status(400).json({ message: "Resume text is required" });
    }

    const result = await aiService.analyzeResume(
      resumeText,
      jobDescription || "",
      withJobDescription !== undefined ? withJobDescription : true,
      temperature,
      maxTokens,
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rephrase resume text
// @route   POST /api/resume/rephrase
// @access  Private
const rephraseText = async (req, res) => {
  try {
    const { text, temperature, maxTokens } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const result = await aiService.rephraseText(text, temperature, maxTokens);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate cover letter
// @route   POST /api/resume/cover-letter
// @access  Private
const generateCoverLetter = async (req, res) => {
  try {
    const { resumeText, jobDescription, temperature, maxTokens } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ message: "Resume text and job description are required" });
    }

    const result = await aiService.generateCoverLetter(
      resumeText,
      jobDescription,
      temperature,
      maxTokens,
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate interview questions from job description
// @route   POST /api/resume/interview-questions
// @access  Private
const generateInterviewQuestions = async (req, res) => {
  try {
    const { jobDescription, temperature, maxTokens } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required" });
    }

    const result = await aiService.generateInterviewQuestions(
      jobDescription,
      temperature,
      maxTokens,
    );
    res.json(result);
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
  analyzeResumeText,
  rephraseText,
  generateCoverLetter,
  generateInterviewQuestions,
  getResumeHistory,
};
