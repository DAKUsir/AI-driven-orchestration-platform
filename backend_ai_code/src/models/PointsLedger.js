const mongoose = require("mongoose");

const pointsLedgerSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["leetcode-solved", "contest-participated", "quiz-completed", "gfg-solved"],
    },
    points: {
      type: Number,
      required: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

pointsLedgerSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("PointsLedger", pointsLedgerSchema);
