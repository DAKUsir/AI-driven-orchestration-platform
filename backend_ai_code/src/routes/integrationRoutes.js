const express = require("express");
const router = express.Router();
const {
  connectPlatform,
  syncAllProgress,
  syncPlatform,
  getIntegrations,
  addProject,
  getProjects,
  removeProject,
  syncProject,
} = require("../controllers/integrationController");
const { protect } = require("../middleware/authMiddleware");

// Platform profiles
router.post("/connect", protect, connectPlatform);
router.post("/sync", protect, syncAllProgress);
router.post("/sync/:platform", protect, syncPlatform);
router.get("/", protect, getIntegrations);

// Projects
router.post("/projects", protect, addProject);
router.get("/projects", protect, getProjects);
router.delete("/projects/:id", protect, removeProject);
router.post("/projects/:id/sync", protect, syncProject);

module.exports = router;
