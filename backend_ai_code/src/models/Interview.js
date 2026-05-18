const mongoose = require("mongoose");

const interviewSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
    },
    questions: [
      {
        question: String,
        category: String,
      },
    ],
    answers: [
      {
        questionId: String,
        answer: String,
        feedback: String,
        score: Number,
      },
    ],
    score: {
      type: Number,
    },
    confidenceScore: {
      type: Number,
    },
    communicationScore: {
      type: Number,
    },
    technicalScore: {
      type: Number,
    },
    feedback: {
      type: String,
    },
    duration: {
      type: Number, // in minutes
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interview", interviewSchema);
