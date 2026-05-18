const express = require("express");
const router = express.Router();
const {
  handleChat,
  handleRoadmapGeneration,
  handleDebug,
} = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.post("/chat", protect, handleChat);
router.post("/roadmap", protect, handleRoadmapGeneration);
router.post("/debug", protect, handleDebug);

module.exports = router;
