const express = require("express");
const router = express.Router();
const { handleChat, generateTasks, suggestYoutubePlaylists } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.post("/chat", protect, handleChat);
router.post("/generate-tasks", protect, generateTasks);
router.post("/youtube-suggest", protect, suggestYoutubePlaylists);

module.exports = router;
