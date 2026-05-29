const mongoose = require("mongoose");

const globalMessageSchema = mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 500,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for fast retrieval of recent messages
globalMessageSchema.index({ timestamp: -1 });

module.exports = mongoose.model("GlobalMessage", globalMessageSchema);
