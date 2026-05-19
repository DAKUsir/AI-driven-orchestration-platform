const mongoose = require("mongoose");

const youtubeCourseSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    playlistId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    thumbnail: {
      type: String,
      default: "",
    },
    channelTitle: {
      type: String,
      default: "",
    },
    totalVideos: {
      type: Number,
      default: 0,
    },
    completedVideos: {
      type: Number,
      default: 0,
    },
    progressPercentage: {
      type: Number,
      default: 0,
    },
    estimatedHours: {
      type: Number,
      default: 0,
    },
    lastWatchedVideo: {
      title: String,
      videoId: String,
      position: Number,
    },
    lastSynced: {
      type: Date,
    },
    category: {
      type: String,
      enum: [
        "dsa", "web-dev", "python", "java", "ml-ai",
        "devops", "mobile", "database", "system-design",
        "general", "other",
      ],
      default: "general",
    },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed", "dropped"],
      default: "not-started",
    },
    isCourse: {
      type: Boolean,
      default: true,
    },
    videos: [
      {
        videoId: String,
        title: String,
        duration: String,
        durationSeconds: Number,
        position: Number,
        watched: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

youtubeCourseSchema.index({ userId: 1, playlistId: 1 }, { unique: true });
youtubeCourseSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("YoutubeCourse", youtubeCourseSchema);
