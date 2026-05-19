const User = require("../models/User");
const PointsLedger = require("../models/PointsLedger");
const GroupChat = require("../models/GroupChat");

// Points based only on problem-solving: LeetCode, GFG, contests
const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const users = await User.find({})
      .select("name email avatar totalSolved streak longestStreak points")
      .lean();

    const leaderboard = users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      points: user.points || 0,
      streak: user.streak || 0,
      totalSolved: user.totalSolved || 0,
    }));

    leaderboard.sort((a, b) => b.points - a.points);
    const ranked = leaderboard.map((entry, i) => ({ ...entry, rank: i + 1 }));

    res.json(ranked.slice(0, limit));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserRank = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("name email avatar totalSolved streak longestStreak points")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    const userPoints = user.points || 0;
    const higherCount = await User.countDocuments({ points: { $gt: userPoints } });

    res.json({
      _id: user._id,
      name: user.name,
      points: userPoints,
      rank: higherCount + 1,
      streak: user.streak || 0,
      totalSolved: user.totalSolved || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGroupLeaderboard = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await GroupChat.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.members.includes(req.user.id))
      return res.status(403).json({ message: "Not a member" });

    const members = await User.find({ _id: { $in: group.members } })
      .select("name email avatar totalSolved streak points")
      .lean();

    const leaderboard = members.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      points: user.points || 0,
      streak: user.streak || 0,
      totalSolved: user.totalSolved || 0,
    }));

    leaderboard.sort((a, b) => b.points - a.points);
    const ranked = leaderboard.map((entry, i) => ({ ...entry, rank: i + 1 }));
    res.json(ranked);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaderboard, getUserRank, getGroupLeaderboard };
