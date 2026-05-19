const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const {
  uploadResume,
  analyzeResumeText,
  rephraseText,
  generateCoverLetter,
  generateInterviewQuestions,
  getResumeHistory,
} = require("../controllers/resumeController");
const { protect } = require("../middleware/authMiddleware");

router.post("/upload", protect, upload.single("resume"), uploadResume);
router.post("/analyze", protect, analyzeResumeText);
router.post("/rephrase", protect, rephraseText);
router.post("/cover-letter", protect, generateCoverLetter);
router.post("/interview-questions", protect, generateInterviewQuestions);
router.get("/history", protect, getResumeHistory);

module.exports = router;
