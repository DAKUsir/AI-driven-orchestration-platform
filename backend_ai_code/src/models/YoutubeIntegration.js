const mongoose = require("mongoose");

const youtubeIntegrationSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    googleId: {
      type: String,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    tokenExpiry: {
      type: Date,
    },
    channelId: {
      type: String,
    },
    channelTitle: {
      type: String,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    lastSynced: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("YoutubeIntegration", youtubeIntegrationSchema);
