const Course = require("../models/Course");

// @desc    Get all courses for user
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res) => {
  try {
    const { status, platform } = req.query;
    const filter = { userId: req.user.id };
    if (status) filter.status = status;
    if (platform) filter.platform = platform;

    const courses = await Course.find(filter).sort({ updatedAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a course to track
// @route   POST /api/courses
// @access  Private
const addCourse = async (req, res) => {
  try {
    const {
      title, platform, url, instructor, totalModules,
      notes, thumbnailUrl, tags,
    } = req.body;

    if (!title || !platform || !url) {
      return res.status(400).json({ message: "Title, platform, and URL are required" });
    }

    const course = await Course.create({
      userId: req.user.id,
      title,
      platform,
      url,
      instructor: instructor || "",
      totalModules: totalModules || 1,
      notes: notes || "",
      thumbnailUrl: thumbnailUrl || "",
      tags: tags || [],
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update course progress
// @route   PATCH /api/courses/:id
// @access  Private
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.userId.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    const fields = [
      "title", "platform", "url", "instructor", "totalModules",
      "completedModules", "status", "notes", "thumbnailUrl", "tags",
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) course[f] = req.body[f];
    });

    // Auto-set timestamps
    if (course.status === "in-progress" && !course.startedAt) {
      course.startedAt = new Date();
    }
    if (course.status === "completed" && !course.completedAt) {
      course.completedAt = new Date();
    }

    // Auto-complete if all modules done
    if (course.completedModules >= course.totalModules && course.status !== "completed") {
      course.status = "completed";
      course.completedAt = new Date();
    }

    const updated = await course.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.userId.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get course stats
// @route   GET /api/courses/stats
// @access  Private
const getCourseStats = async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.user.id });
    const total = courses.length;
    const completed = courses.filter((c) => c.status === "completed").length;
    const inProgress = courses.filter((c) => c.status === "in-progress").length;
    const notStarted = courses.filter((c) => c.status === "not-started").length;

    const byPlatform = {};
    courses.forEach((c) => {
      if (!byPlatform[c.platform]) byPlatform[c.platform] = 0;
      byPlatform[c.platform]++;
    });

    res.json({ total, completed, inProgress, notStarted, byPlatform });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCourses, addCourse, updateCourse, deleteCourse, getCourseStats };
