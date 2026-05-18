const mongoose = require("mongoose");

const resumeSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalFile: {
      type: String, // URL or path to file
      required: true,
    },
    extractedText: {
      type: String,
    },
    atsScore: {
      type: Number,
    },
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    targetRole: {
      type: String,
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resume", resumeSchema);
