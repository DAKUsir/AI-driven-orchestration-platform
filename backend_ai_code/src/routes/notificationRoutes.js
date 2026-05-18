const express = require("express");
const router = express.Router();
const {
  getNotifications,
  createNotification,
  markAsRead,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getNotifications);
router.post("/", protect, createNotification);
router.patch("/:id", protect, markAsRead);

module.exports = router;
