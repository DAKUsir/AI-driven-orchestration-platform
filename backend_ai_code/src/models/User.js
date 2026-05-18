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
    dailyStudyHours: {
      type: Number,
      default: 0,
    },
    year: {
      type: Number,
      enum: [1, 2, 3, 4],
    },
    department: {
      type: String,
    },
    leetcodeUsername: {
      type: String,
    },
    gfgUsername: {
      type: String,
    },
    githubUsername: {
      type: String,
    },
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
    currentRoadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
    },
    points: {
      type: Number,
      default: 0,
    },
    aiTokensUsed: {
      type: Number,
      default: 0,
    },
    customAiApiKey: {
      type: String,
    },
    aiRequestCount: {
      type: Number,
      default: 0,
    },
    aiRateLimitReset: {
      type: Date,
    },
    isPremium: {
      type: Boolean,
      default: false,
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
