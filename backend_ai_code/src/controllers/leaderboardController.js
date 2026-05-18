const User = require("../models/User");
const GroupChat = require("../models/GroupChat");

const computePoints = (user) => {
  let points = 0;
  points += (user.totalSolved || 0) * 10;
  points += (user.streak || 0) * 5;
  points += (user.totalStudyHours || 0) * 2;
  points += (user.longestStreak || 0) * 3;
  points += (user.skills?.length || 0) * 15;
  if (user.onboardingCompleted) points += 50;
  if (user.isPremium) points += 100;
  return points;
};

const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const users = await User.find({})
      .select("name email avatar totalSolved streak longestStreak totalStudyHours skills onboardingCompleted isPremium points")
      .lean();

    const leaderboard = users.map((user) => {
      const points = user.points || computePoints(user);
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        points,
        streak: user.streak || 0,
        totalSolved: user.totalSolved || 0,
      };
    });

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
      .select("name email avatar totalSolved streak longestStreak totalStudyHours skills onboardingCompleted isPremium points")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userPoints = user.points || computePoints(user);

    const allUsers = await User.find({})
      .select("points totalSolved streak longestStreak totalStudyHours skills onboardingCompleted isPremium")
      .lean();

    let higherRanked = 0;
    for (const other of allUsers) {
      if (other._id.toString() === req.user.id) continue;
      const otherPoints = other.points || computePoints(other);
      if (otherPoints > userPoints) higherRanked++;
    }

    res.json({
      _id: user._id,
      name: user.name,
      points: userPoints,
      rank: higherRanked + 1,
      streak: user.streak || 0,
      totalSolved: user.totalSolved || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard for a specific group
// @route   GET /api/leaderboard/group/:groupId
// @access  Private
const getGroupLeaderboard = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await GroupChat.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    const members = await User.find({ _id: { $in: group.members } })
      .select("name email avatar totalSolved streak longestStreak totalStudyHours skills onboardingCompleted isPremium points")
      .lean();

    const leaderboard = members.map((user) => {
      const points = user.points || computePoints(user);
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        points,
        streak: user.streak || 0,
        totalSolved: user.totalSolved || 0,
      };
    });

    leaderboard.sort((a, b) => b.points - a.points);
    const ranked = leaderboard.map((entry, i) => ({ ...entry, rank: i + 1 }));

    res.json(ranked);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaderboard, getUserRank, getGroupLeaderboard };
