const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
    },
    avatar: {
      type: String,
    },
    emojiAvatar: {
      type: String,
      default: "😀",
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    bio: {
      type: String,
    },
    college: {
      type: String,
    },
    graduationYear: {
      type: Number,
    },
    targetRole: {
      type: String,
    },
    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
    // ── Task orchestration fields ──
    studyGoal: {
      type: String,
      default: "",
    },
    availableHours: {
      type: Number,
      default: 2,
    },
    dailyStudyHours: {
      type: Number,
      default: 0,
    },
    preferredPlatforms: {
      type: [String],
      default: [],
    },
    savedLinks: [
      {
        url: String,
        title: String,
        platform: String,
      },
    ],
    year: {
      type: Number,
      enum: [1, 2, 3, 4],
    },
    department: {
      type: String,
    },
    // ── External platform usernames ──
    leetcodeUsername: {
      type: String,
    },
    gfgUsername: {
      type: String,
    },
    githubUsername: {
      type: String,
    },
    // ── Tracked stats ──
    skills: [String],
    weakTopics: [String],
    strongTopics: [String],
    streak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    totalSolved: {
      type: Number,
      default: 0,
    },
    totalStudyHours: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },
    // ── Notification preferences ──
    notificationPreferences: {
      dailyReminder: { type: Boolean, default: true },
      weeklyReview: { type: Boolean, default: true },
      contestAlerts: { type: Boolean, default: true },
      streakReminder: { type: Boolean, default: true },
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
