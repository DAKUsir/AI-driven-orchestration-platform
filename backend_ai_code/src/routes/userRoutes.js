const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getUserStats,
  getPublicProfile,
  setAiProviderKey,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/profile", protect, getUserProfile);
router.patch("/profile", protect, updateUserProfile);
router.get("/stats", protect, getUserStats);
router.post("/ai-provider", protect, setAiProviderKey);
router.get("/:id/public-profile", protect, getPublicProfile);

module.exports = router;
