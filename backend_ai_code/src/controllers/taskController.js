const Task = require("../models/Task");
const User = require("../models/User");

const POINTS_MAP = {
  "problem-solving": 15,
  video: 5,
  article: 5,
  quiz: 10,
  project: 25,
  "mock-interview": 20,
  resume: 10,
  behavioral: 10,
  "system-design": 20,
};

// @desc    Create new task
// @route   POST /api/tasks/create
// @access  Private
const createTask = async (req, res) => {
  try {
    const { roadmapId, title, description, taskType, difficulty, kanbanStatus } = req.body;

    const task = await Task.create({
      userId: req.user.id,
      roadmapId: roadmapId || undefined,
      title,
      description,
      taskType,
      difficulty,
      kanbanStatus: kanbanStatus || 'backlog',
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks for current user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PATCH /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      if (task.userId.toString() !== req.user.id) {
        return res.status(401).json({ message: "Not authorized" });
      }

      const wasCompleted = task.completed;
      task.title = req.body.title || task.title;
      task.description = req.body.description || task.description;
      task.completed = req.body.completed !== undefined ? req.body.completed : task.completed;
      task.completedAt = req.body.completed ? Date.now() : task.completedAt;
      task.notes = req.body.notes || task.notes;
      if (req.body.kanbanStatus) {
        task.kanbanStatus = req.body.kanbanStatus;
      }

      const updatedTask = await task.save();

      if (task.completed && !wasCompleted) {
        const points = POINTS_MAP[task.taskType] || 10;
        await User.findByIdAndUpdate(req.user.id, { $inc: { points, totalSolved: 1 } });
      }

      res.json(updatedTask);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      if (task.userId.toString() !== req.user.id) {
        return res.status(401).json({ message: "Not authorized" });
      }

      await task.remove();
      res.json({ message: "Task removed" });
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
