const express = require("express");
const router = express.Router();
const {
  createGroup,
  joinGroup,
  leaveGroup,
  getMyGroups,
  getGroupMessages,
  getGroupDetails,
  sendMessage,
  getGlobalMessages,
  sendGlobalMessage,
} = require("../controllers/groupChatController");
const { protect } = require("../middleware/authMiddleware");

// Global chat routes (must be before /:id routes)
router.get("/global/messages", protect, getGlobalMessages);
router.post("/global/messages", protect, sendGlobalMessage);

router.get("/", protect, getMyGroups);
router.post("/", protect, createGroup);
router.post("/join", protect, joinGroup);
router.get("/:id", protect, getGroupDetails);
router.get("/:id/messages", protect, getGroupMessages);
router.post("/:id/messages", protect, sendMessage);
router.post("/:id/leave", protect, leaveGroup);

module.exports = router;
