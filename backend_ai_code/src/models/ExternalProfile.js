const mongoose = require("mongoose");

const externalProfileSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String,
      required: true,
      enum: [
        "LeetCode",
        "GeeksForGeeks",
        "Codeforces",
        "CodeChef",
        "Kaggle",
        "GitHub",
        "LinkedIn",
        "HackerRank",
      ],
    },
    username: {
      type: String,
      required: true,
    },
    profileUrl: {
      type: String,
    },
    solvedProblems: {
      type: Number,
      default: 0,
    },
    ranking: {
      type: String,
    },
    badges: [String],
    contestsParticipated: {
      type: Number,
      default: 0,
    },
    easySolved: {
      type: Number,
      default: 0,
    },
    mediumSolved: {
      type: Number,
      default: 0,
    },
    hardSolved: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastSynced: {
      type: Date,
      default: Date.now,
    },
    rawData: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ExternalProfile", externalProfileSchema);
