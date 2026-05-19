const mongoose = require("mongoose");

const sheetLinkSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    problemCount: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      enum: ["beginner", "revision", "interview-ready", "mixed", "company-specific"],
      default: ["mixed"],
    },
    category: {
      type: String,
      default: "DSA",
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SheetLink", sheetLinkSchema);
