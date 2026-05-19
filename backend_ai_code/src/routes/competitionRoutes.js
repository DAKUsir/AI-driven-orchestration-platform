const express = require("express");
const router = express.Router();
const {
  getCompetitions,
  setReminder,
  removeReminder,
  seedCompetitions,
} = require("../controllers/competitionController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getCompetitions);
router.post("/:id/reminder", protect, setReminder);
router.delete("/:id/reminder", protect, removeReminder);
router.post("/seed", protect, seedCompetitions);

module.exports = router;
