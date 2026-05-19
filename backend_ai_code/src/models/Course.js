const mongoose = require("mongoose");

const courseSchema = mongoose.Schema(
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
    platform: {
      type: String,
      required: true,
      enum: ["youtube", "coursera", "udemy", "edx", "skillshare", "other"],
    },
    url: {
      type: String,
      required: true,
    },
    instructor: {
      type: String,
      default: "",
    },
    totalModules: {
      type: Number,
      default: 1,
    },
    completedModules: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed", "dropped"],
      default: "not-started",
    },
    notes: {
      type: String,
      default: "",
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

courseSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("Course", courseSchema);
