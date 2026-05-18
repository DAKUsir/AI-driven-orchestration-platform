const mongoose = require("mongoose");

const roadmapSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    durationWeeks: {
      type: Number,
      required: true,
    },
    generatedByAI: {
      type: Boolean,
      default: true,
    },
    currentWeek: {
      type: Number,
      default: 1,
    },
    completionPercentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused", "archived"],
      default: "active",
    },
    milestones: [
      {
        week: Number,
        title: String,
        description: String,
        completed: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Roadmap", roadmapSchema);
