const express = require("express");
const router = express.Router();
const {
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
} = require("../controllers/courseController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getCourses);
router.get("/stats", protect, getCourseStats);
router.post("/", protect, addCourse);
router.patch("/:id", protect, updateCourse);
router.delete("/:id", protect, deleteCourse);

module.exports = router;
