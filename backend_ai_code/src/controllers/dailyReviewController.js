const DailyReview = require("../models/DailyReview");
const Task = require("../models/Task");

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

// @desc    Get daily review for a specific date
// @route   GET /api/daily-reviews?date=YYYY-MM-DD
// @access  Private
const getDailyReview = async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().split("T")[0];
    const date = startOfDay(new Date(dateStr));
    const dateEnd = endOfDay(new Date(dateStr));

    let review = await DailyReview.findOne({
      userId: req.user.id,
      date: { $gte: date, $lte: dateEnd },
    }).populate("planned completed skipped carryForward");

    if (!review) {
      // Build review from tasks
      const dayTasks = await Task.find({
        userId: req.user.id,
        dueDate: { $gte: date, $lte: dateEnd },
      });

      const planned = dayTasks.map((t) => t._id);
      const completed = dayTasks.filter((t) => t.status === "done").map((t) => t._id);
      const skipped = dayTasks.filter((t) => t.status === "skipped").map((t) => t._id);
      const carryForward = dayTasks
        .filter((t) => t.isCarryForward && t.status !== "done")
        .map((t) => t._id);

      const focusScore =
        planned.length > 0
          ? Math.round((completed.length / planned.length) * 100)
          : 0;

      review = await DailyReview.create({
        userId: req.user.id,
        date,
        planned,
        completed,
        skipped,
        carryForward,
        focusScore,
      });

      review = await DailyReview.findById(review._id).populate(
        "planned completed skipped carryForward"
      );
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get weekly review (what slipped this week)
// @route   GET /api/daily-reviews/weekly
// @access  Private
const getWeeklyReview = async (req, res) => {
  try {
    const today = startOfDay();
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);

    const reviews = await DailyReview.find({
      userId: req.user.id,
      date: { $gte: weekStart, $lte: today },
    }).populate("planned completed skipped carryForward");

    let totalPlanned = 0;
    let totalCompleted = 0;
    let totalSkipped = 0;
    let totalCarried = 0;

    reviews.forEach((r) => {
      totalPlanned += r.planned.length;
      totalCompleted += r.completed.length;
      totalSkipped += r.skipped.length;
      totalCarried += r.carryForward.length;
    });

    const avgFocus =
      reviews.length > 0
        ? Math.round(reviews.reduce((acc, r) => acc + r.focusScore, 0) / reviews.length)
        : 0;

    // Collect slipped task titles
    const slipped = [];
    reviews.forEach((r) => {
      r.carryForward.forEach((t) => {
        if (t && t.title) slipped.push(t.title);
      });
      r.skipped.forEach((t) => {
        if (t && t.title) slipped.push(t.title);
      });
    });

    res.json({
      totalPlanned,
      totalCompleted,
      totalSkipped,
      totalCarried,
      avgFocus,
      slippedTasks: [...new Set(slipped)],
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDailyReview, getWeeklyReview };
