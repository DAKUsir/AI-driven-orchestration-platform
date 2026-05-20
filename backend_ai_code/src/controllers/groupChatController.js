const GroupChat = require("../models/GroupChat");
const User = require("../models/User");
const crypto = require("crypto");
const { getIO } = require("../utils/ioSingleton");

// Generate a random 6-character invite code
const generateCode = () => crypto.randomBytes(3).toString("hex").toUpperCase();

// @desc    Send a message to a group (REST fallback)
// @route   POST /api/groups/:id/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const group = await GroupChat.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.some((m) => m.toString() === req.user.id)) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    const message = {
      sender: req.user.id,
      content: content.trim(),
      type: "text",
      timestamp: new Date(),
    };

    group.messages.push(message);
    await group.save();

    const savedMsg = group.messages[group.messages.length - 1];
    const sender = await User.findById(req.user.id).select("name email avatar");

    const populated = {
      _id: savedMsg._id,
      sender: { _id: sender._id, name: sender.name, email: sender.email, avatar: sender.avatar },
      content: savedMsg.content,
      type: savedMsg.type,
      timestamp: savedMsg.timestamp,
    };

    // Broadcast to all OTHER members in the group room (sender already has it locally)
    const io = getIO();
    if (io) {
      io.to(req.params.id).emit("receive-message", populated);
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    let code = generateCode();
    // Ensure uniqueness
    while (await GroupChat.findOne({ code })) {
      code = generateCode();
    }

    const group = await GroupChat.create({
      name: name.trim(),
      description: description || "",
      code,
      members: [req.user.id],
      createdBy: req.user.id,
      messages: [
        {
          sender: req.user.id,
          content: "created this group",
          type: "system",
        },
      ],
    });

    const populated = await GroupChat.findById(group._id)
      .populate("members", "name email avatar")
      .populate("createdBy", "name email");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a group via invite code
// @route   POST /api/groups/join
// @access  Private
const joinGroup = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Invite code is required" });
    }

    const group = await GroupChat.findOne({ code: code.toUpperCase(), isActive: true });
    if (!group) {
      return res.status(404).json({ message: "Group not found with that code" });
    }

    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ message: "You are already in this group" });
    }

    group.members.push(req.user.id);
    group.messages.push({
      sender: req.user.id,
      content: "joined the group",
      type: "system",
    });
    await group.save();

    const populated = await GroupChat.findById(group._id)
      .populate("members", "name email avatar")
      .populate("createdBy", "name email");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave a group
// @route   POST /api/groups/:id/leave
// @access  Private
const leaveGroup = async (req, res) => {
  try {
    const group = await GroupChat.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.members = group.members.filter(
      (m) => m.toString() !== req.user.id
    );
    group.messages.push({
      sender: req.user.id,
      content: "left the group",
      type: "system",
    });
    await group.save();

    res.json({ message: "Left group successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my groups
// @route   GET /api/groups
// @access  Private
const getMyGroups = async (req, res) => {
  try {
    const groups = await GroupChat.find({
      members: req.user.id,
      isActive: true,
    })
      .populate("members", "name email avatar")
      .populate("createdBy", "name email")
      .sort({ updatedAt: -1 });

    // Return groups with last message preview
    const groupsWithPreview = groups.map((g) => {
      const obj = g.toObject();
      const lastMsg = obj.messages[obj.messages.length - 1];
      obj.lastMessage = lastMsg || null;
      obj.memberCount = obj.members.length;
      // Don't send full message history in list view
      delete obj.messages;
      return obj;
    });

    res.json(groupsWithPreview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get group messages (paginated)
// @route   GET /api/groups/:id/messages
// @access  Private
const getGroupMessages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    const group = await GroupChat.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    // Get paginated messages (newest first in the slice, but return chronological)
    const totalMessages = group.messages.length;
    const start = Math.max(0, totalMessages - skip - limit);
    const end = totalMessages - skip;
    const messages = group.messages.slice(start, end);

    // Populate sender info
    const User = require("../models/User");
    const senderIds = [...new Set(messages.map((m) => m.sender.toString()))];
    const users = await User.find({ _id: { $in: senderIds } }).select(
      "name email avatar"
    );
    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = u;
    });

    const populatedMessages = messages.map((m) => ({
      _id: m._id,
      sender: userMap[m.sender.toString()] || { name: "Unknown" },
      content: m.content,
      type: m.type,
      timestamp: m.timestamp,
    }));

    res.json({
      messages: populatedMessages,
      total: totalMessages,
      hasMore: start > 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get group details
// @route   GET /api/groups/:id
// @access  Private
const getGroupDetails = async (req, res) => {
  try {
    const group = await GroupChat.findById(req.params.id)
      .populate("members", "name email avatar points streak totalSolved")
      .populate("createdBy", "name email");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.some((m) => m._id.toString() === req.user.id)) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGroup,
  joinGroup,
  leaveGroup,
  getMyGroups,
  getGroupMessages,
  getGroupDetails,
  sendMessage,
};

