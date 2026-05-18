const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
    },
    kanbanStatus: {
      type: String,
      enum: ["backlog", "todo", "in-progress", "done"],
      default: "backlog",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    platform: {
      type: String,
    },
    platformLink: {
      type: String,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
    },
    estimatedMinutes: {
      type: Number,
    },
    taskType: {
      type: String,
      enum: [
        "problem-solving",
        "video",
        "article",
        "quiz",
        "project",
        "mock-interview",
        "resume",
        "behavioral",
        "system-design",
      ],
    },
    tags: [String],
    dueDate: {
      type: Date,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    aiGenerated: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);
