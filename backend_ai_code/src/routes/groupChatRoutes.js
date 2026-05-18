const express = require("express");
const router = express.Router();
const {
  createGroup,
  joinGroup,
  leaveGroup,
  getMyGroups,
  getGroupMessages,
  getGroupDetails,
} = require("../controllers/groupChatController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getMyGroups);
router.post("/", protect, createGroup);
router.post("/join", protect, joinGroup);
router.get("/:id", protect, getGroupDetails);
router.get("/:id/messages", protect, getGroupMessages);
router.post("/:id/leave", protect, leaveGroup);

module.exports = router;
