const express = require("express");
const router = express.Router();
const {
  connectYoutube,
  youtubeCallback,
  getYoutubeStatus,
  getYoutubeCourses,
  getYoutubeCourseDetail,
  syncYoutube,
  addPlaylistByUrl,
  toggleVideoWatched,
  updateYoutubeCourse,
  generateTasksFromCourse,
  deleteYoutubeCourse,
  disconnectYoutube,
} = require("../controllers/youtubeController");
const { protect } = require("../middleware/authMiddleware");

// OAuth flow
router.get("/connect", protect, connectYoutube);
router.get("/callback", youtubeCallback); // Public — Google redirects here

// Status
router.get("/status", protect, getYoutubeStatus);

// Add playlist by URL (no OAuth needed)
router.post("/add-playlist", protect, addPlaylistByUrl);

// Courses
router.get("/courses", protect, getYoutubeCourses);
router.get("/courses/:id", protect, getYoutubeCourseDetail);
router.patch("/courses/:id", protect, updateYoutubeCourse);
router.patch("/courses/:id/video", protect, toggleVideoWatched);
router.post("/courses/:id/generate-tasks", protect, generateTasksFromCourse);
router.delete("/courses/:id", protect, deleteYoutubeCourse);

// Sync
router.post("/sync", protect, syncYoutube);

// Disconnect
router.delete("/disconnect", protect, disconnectYoutube);

module.exports = router;
