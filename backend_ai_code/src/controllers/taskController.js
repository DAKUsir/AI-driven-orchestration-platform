const Task = require("../models/Task");
const Streak = require("../models/Streak");
const User = require("../models/User");

// ── Points only for problem-solving categories ──
const POINTS_CATEGORIES = {
  leetcode: 15,
  gfg: 10,
};

// ── Helper: start of today (UTC) ──
const startOfDay = (d = new Date()) => {
  const day = new Date(d);
  day.setUTCHours(0, 0, 0, 0);
  return day;
};

const endOfDay = (d = new Date()) => {
  const day = new Date(d);
  day.setUTCHours(23, 59, 59, 999);
  return day;
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const {
      title, description, sourceLink, category, priority,
      difficulty, dueDate, estimatedMinutes, tags, calendarSlot, notes,
    } = req.body;

    const task = await Task.create({
      userId: req.user.id,
      title,
      description,
      sourceLink,
      category: category || "other",
      priority: priority || "medium",
      difficulty,
      dueDate,
      estimatedMinutes: estimatedMinutes || 30,
      tags: tags || [],
      calendarSlot,
      notes,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks with optional filters
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, category, priority, from, to, tag, sort } = req.query;
    const filter = { userId: req.user.id };

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (tag) filter.tags = { $in: [tag] };
    if (from || to) {
      filter.dueDate = {};
      if (from) filter.dueDate.$gte = new Date(from);
      if (to) filter.dueDate.$lte = new Date(to);
    }

    const sortObj = sort === "priority"
      ? { priority: 1 }
      : sort === "dueDate"
        ? { dueDate: 1 }
        : { createdAt: -1 };

    const tasks = await Task.find(filter).sort(sortObj);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's tasks (due today + carry-forward)
// @route   GET /api/tasks/today
// @access  Private
const getDailyTasks = async (req, res) => {
  try {
    const today = startOfDay();
    const tonightEnd = endOfDay();

    const tasks = await Task.find({
      userId: req.user.id,
      $or: [
        { dueDate: { $gte: today, $lte: tonightEnd } },
        { isCarryForward: true, status: { $in: ["pending", "in-progress"] } },
      ],
    }).sort({ priority: -1, dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get weekly overview (tasks grouped by day)
// @route   GET /api/tasks/weekly
// @access  Private
const getWeeklyOverview = async (req, res) => {
  try {
    const today = startOfDay();
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const tasks = await Task.find({
      userId: req.user.id,
      dueDate: { $gte: today, $lt: weekEnd },
    }).sort({ dueDate: 1 });

    // Group by day
    const grouped = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      grouped[key] = [];
    }

    tasks.forEach((task) => {
      if (task.dueDate) {
        const key = task.dueDate.toISOString().split("T")[0];
        if (grouped[key]) grouped[key].push(task);
      }
    });

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PATCH /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.userId.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    const wasCompleted = task.status === "done";
    const allowedFields = [
      "title", "description", "sourceLink", "category", "status",
      "priority", "difficulty", "dueDate", "estimatedMinutes",
      "actualMinutes", "tags", "calendarSlot", "notes",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    // Mark completion timestamp
    if (task.status === "done" && !wasCompleted) {
      task.completedAt = new Date();

      // Award points for problem-solving categories only
      const pts = POINTS_CATEGORIES[task.category];
      if (pts) {
        await User.findByIdAndUpdate(req.user.id, {
          $inc: { points: pts, totalSolved: 1 },
        });
      }

      // Update streak
      await _updateStreak(req.user.id);
    }

    // Clear carry-forward if task is done or rescheduled
    if (task.status === "done" || task.status === "skipped") {
      task.isCarryForward = false;
    }

    const updated = await task.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.userId.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Carry forward missed tasks from yesterday
// @route   POST /api/tasks/carry-forward
// @access  Private
const carryForwardMissed = async (req, res) => {
  try {
    const yesterday = startOfDay();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEnd = endOfDay(yesterday);

    const missedTasks = await Task.find({
      userId: req.user.id,
      dueDate: { $gte: yesterday, $lte: yesterdayEnd },
      status: { $in: ["pending", "in-progress"] },
    });

    const today = startOfDay();
    const carried = [];

    for (const task of missedTasks) {
      task.isCarryForward = true;
      task.originalDueDate = task.originalDueDate || task.dueDate;
      task.dueDate = today;
      await task.save();
      carried.push(task);
    }

    res.json({ carried: carried.length, tasks: carried });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk update task statuses
// @route   PATCH /api/tasks/bulk-status
// @access  Private
const bulkUpdateStatus = async (req, res) => {
  try {
    const { taskIds, status } = req.body;
    if (!taskIds || !status)
      return res.status(400).json({ message: "taskIds and status required" });

    const result = await Task.updateMany(
      { _id: { $in: taskIds }, userId: req.user.id },
      {
        $set: {
          status,
          ...(status === "done" ? { completedAt: new Date() } : {}),
          ...(status === "done" || status === "skipped" ? { isCarryForward: false } : {}),
        },
      }
    );

    // Update streak if marking done
    if (status === "done") {
      await _updateStreak(req.user.id);
    }

    res.json({ modified: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Internal: update user streak ──
async function _updateStreak(userId) {
  const today = startOfDay();
  let streak = await Streak.findOne({ userId });

  if (!streak) {
    streak = await Streak.create({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
      streakHistory: [{ date: today, tasksCompleted: 1 }],
    });
  } else {
    const lastActive = streak.lastActiveDate ? startOfDay(streak.lastActiveDate) : null;
    const todayMs = today.getTime();

    if (lastActive && lastActive.getTime() === todayMs) {
      // Same day — increment tasksCompleted in history
      const entry = streak.streakHistory.find(
        (h) => startOfDay(h.date).getTime() === todayMs
      );
      if (entry) entry.tasksCompleted += 1;
    } else if (lastActive && todayMs - lastActive.getTime() === 86400000) {
      // Consecutive day
      streak.currentStreak += 1;
      streak.streakHistory.push({ date: today, tasksCompleted: 1 });
    } else {
      // Streak broken
      streak.currentStreak = 1;
      streak.streakHistory.push({ date: today, tasksCompleted: 1 });
    }

    streak.lastActiveDate = today;
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }
    await streak.save();
  }

  // Mirror to User model
  await User.findByIdAndUpdate(userId, {
    streak: streak.currentStreak,
    longestStreak: streak.longestStreak,
  });
}

module.exports = {
  createTask,
  getTasks,
  getDailyTasks,
  getWeeklyOverview,
  updateTask,
  deleteTask,
  carryForwardMissed,
  bulkUpdateStatus,
};
