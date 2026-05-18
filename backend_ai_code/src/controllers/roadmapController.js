const Roadmap = require("../models/Roadmap");

// @desc    Generate roadmap (placeholder for AI)
// @route   POST /api/roadmap/generate
// @access  Private
const generateRoadmap = async (req, res) => {
  try {
    const { title, role, durationWeeks } = req.body;

    const roadmap = await Roadmap.create({
      userId: req.user.id,
      title,
      role,
      durationWeeks,
      status: "active",
    });

    res.status(201).json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current roadmap
// @route   GET /api/roadmap/current
// @access  Private
const getCurrentRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({
      userId: req.user.id,
      status: "active",
    }).sort({ createdAt: -1 });

    if (roadmap) {
      res.json(roadmap);
    } else {
      res.status(404).json({ message: "No active roadmap found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update roadmap
// @route   PATCH /api/roadmap/update
// @access  Private
const updateRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({
      userId: req.user.id,
      status: "active",
    });

    if (roadmap) {
      roadmap.currentWeek = req.body.currentWeek || roadmap.currentWeek;
      roadmap.status = req.body.status || roadmap.status;
      roadmap.completionPercentage = req.body.completionPercentage || roadmap.completionPercentage;

      const updatedRoadmap = await roadmap.save();
      res.json(updatedRoadmap);
    } else {
      res.status(404).json({ message: "No active roadmap found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete roadmap
// @route   DELETE /api/roadmap/delete
// @access  Private
const deleteRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({
      userId: req.user.id,
      status: "active",
    });

    if (roadmap) {
      await roadmap.remove();
      res.json({ message: "Roadmap removed" });
    } else {
      res.status(404).json({ message: "No active roadmap found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateRoadmap,
  getCurrentRoadmap,
  updateRoadmap,
  deleteRoadmap,
};
