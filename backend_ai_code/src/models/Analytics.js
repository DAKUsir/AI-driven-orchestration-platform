const mongoose = require("mongoose");

const analyticsSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dailyStudyTime: [
      {
        date: Date,
        minutes: Number,
      },
    ],
    weeklyProgress: [
      {
        weekStart: Date,
        completionPercentage: Number,
      },
    ],
    solvedProblems: {
      type: Number,
      default: 0,
    },
    weakTopicFrequency: {
      type: Map,
      of: Number,
    },
    interviewScores: [
      {
        interviewId: mongoose.Schema.Types.ObjectId,
        score: Number,
        date: Date,
      },
    ],
    consistencyScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Analytics", analyticsSchema);
