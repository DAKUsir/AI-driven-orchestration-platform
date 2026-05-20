const mongoose = require("mongoose");

const competitionSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ["codeforces", "leetcode", "codechef", "techgig", "hackerrank", "hackerearth", "other"],
    },
    url: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: String,
      default: "",
    },
    registrationDeadline: {
      type: Date,
    },
    eligibility: {
      type: String,
      default: "Open to all",
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    reminders: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

competitionSchema.index({ startTime: 1 });
competitionSchema.index({ platform: 1, title: 1 }, { unique: true });

module.exports = mongoose.model("Competition", competitionSchema);
