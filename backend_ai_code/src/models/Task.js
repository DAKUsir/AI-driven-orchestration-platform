const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    sourceLink: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: [
        "youtube",
        "coursera",
        "github",
        "leetcode",
        "gfg",
        "kaggle",
        "interview-prep",
        "other",
      ],
      default: "other",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "done", "skipped"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
    estimatedMinutes: {
      type: Number,
      default: 30,
    },
    actualMinutes: {
      type: Number,
    },
    tags: [String],
    isCarryForward: {
      type: Boolean,
      default: false,
    },
    originalDueDate: {
      type: Date,
    },
    calendarSlot: {
      date: { type: Date },
      startTime: { type: String },
      endTime: { type: String },
    },
    completedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: "",
    },
    parentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    subtasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model("Task", taskSchema);
