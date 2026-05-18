const express = require("express");
const router = express.Router();
const {
  connectPlatform,
  syncProgress,
  getIntegrations,
} = require("../controllers/integrationController");
const { protect } = require("../middleware/authMiddleware");

router.post("/connect", protect, connectPlatform);
router.post("/sync", protect, syncProgress);
router.get("/", protect, getIntegrations);

module.exports = router;
