const express = require("express");
const router = express.Router();
const {
  generateRoadmap,
  getCurrentRoadmap,
  updateRoadmap,
  deleteRoadmap,
} = require("../controllers/roadmapController");
const { protect } = require("../middleware/authMiddleware");

router.post("/generate", protect, generateRoadmap);
router.get("/current", protect, getCurrentRoadmap);
router.patch("/update", protect, updateRoadmap);
router.delete("/delete", protect, deleteRoadmap);

module.exports = router;
