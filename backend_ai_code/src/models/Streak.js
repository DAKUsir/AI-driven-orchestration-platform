const mongoose = require("mongoose");

const streakSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
    },
    streakHistory: [
      {
        date: { type: Date, required: true },
        tasksCompleted: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

streakSchema.index({ userId: 1 });

module.exports = mongoose.model("Streak", streakSchema);
