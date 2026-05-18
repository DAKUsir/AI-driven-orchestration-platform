const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ["GitHub", "Kaggle"],
    },
    repoUrl: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    language: {
      type: String,
    },
    stars: {
      type: Number,
      default: 0,
    },
    forks: {
      type: Number,
      default: 0,
    },
    topics: [String],
    category: {
      type: String,
      enum: [
        "Web Dev",
        "AI/ML",
        "Mobile",
        "DevOps",
        "Data Science",
        "Systems",
        "Other",
      ],
      default: "Other",
    },
    lastSynced: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
