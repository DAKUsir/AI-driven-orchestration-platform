const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getDailyTasks,
  getWeeklyOverview,
  updateTask,
  deleteTask,
  carryForwardMissed,
  bulkUpdateStatus,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.get("/today", protect, getDailyTasks);
router.get("/weekly", protect, getWeeklyOverview);
router.post("/carry-forward", protect, carryForwardMissed);
router.patch("/bulk-status", protect, bulkUpdateStatus);
router.patch("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

module.exports = router;
