const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { uploadResume, getResumeHistory } = require("../controllers/resumeController");
const { protect } = require("../middleware/authMiddleware");

router.post("/upload", protect, upload.single("resume"), uploadResume);
router.get("/history", protect, getResumeHistory);

module.exports = router;
