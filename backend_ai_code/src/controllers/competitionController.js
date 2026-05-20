const Competition = require("../models/Competition");
const axios = require("axios");

// @desc    Get all competitions with optional filters
// @route   GET /api/competitions
// @access  Private
const getCompetitions = async (req, res) => {
  try {
    const { platform, status } = req.query;
    const filter = {};

    if (platform) filter.platform = platform;

    const now = new Date();
    if (status === "upcoming") {
      filter.startTime = { $gt: now };
    } else if (status === "ongoing") {
      filter.startTime = { $lte: now };
      filter.endTime = { $gte: now };
    } else if (status === "past") {
      filter.endTime = { $lt: now };
    }

    // Auto-seed on first fetch if DB is empty
    const count = await Competition.countDocuments();
    if (count === 0) {
      await _doSeedCompetitions();
    }

    const competitions = await Competition.find(filter).sort({ startTime: 1 });
    res.json(competitions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set reminder for a competition
// @route   POST /api/competitions/:id/reminder
// @access  Private
const setReminder = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ message: "Competition not found" });

    const alreadySet = competition.reminders.some(
      (r) => r.userId.toString() === req.user.id
    );
    if (alreadySet) {
      return res.json({ message: "Reminder already set" });
    }

    competition.reminders.push({ userId: req.user.id });
    await competition.save();
    res.json({ message: "Reminder set" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove reminder for a competition
// @route   DELETE /api/competitions/:id/reminder
// @access  Private
const removeReminder = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ message: "Competition not found" });

    competition.reminders = competition.reminders.filter(
      (r) => r.userId.toString() !== req.user.id
    );
    await competition.save();
    res.json({ message: "Reminder removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Internal helper — seeds competitions, no req/res needed ──
async function _doSeedCompetitions() {
  let seeded = 0;

    // ── Codeforces API ──
    try {
      const cfRes = await axios.get("https://codeforces.com/api/contest.list?gym=false", {
        timeout: 10000,
      });
      const cfContests = cfRes.data.result || [];
      const upcoming = cfContests
        .filter((c) => c.phase === "BEFORE" || c.phase === "CODING")
        .slice(0, 20);

      for (const c of upcoming) {
        const startTime = new Date(c.startTimeSeconds * 1000);
        const endTime = new Date(startTime.getTime() + c.durationSeconds * 1000);
        // Atomic upsert — no race condition, no duplicates
        const result = await Competition.updateOne(
          { platform: "codeforces", title: c.name },
          {
            $setOnInsert: {
              title: c.name,
              platform: "codeforces",
              url: `https://codeforces.com/contest/${c.id}`,
              startTime,
              endTime,
              duration: `${Math.round(c.durationSeconds / 3600)}h`,
              tags: ["competitive-programming"],
            },
          },
          { upsert: true }
        );
        if (result.upsertedCount) seeded++;
      }
    } catch (err) {
      console.error("[Seed] Codeforces API error:", err.message);
    }

    // ── Static LeetCode entries ──
    const staticContests = [
      {
        title: "LeetCode Weekly Contest",
        platform: "leetcode",
        url: "https://leetcode.com/contest/",
        startTime: _nextSunday(2, 30),
        duration: "1.5h",
        tags: ["competitive-programming", "weekly"],
        eligibility: "Open to all LeetCode users",
      },
      {
        title: "LeetCode Biweekly Contest",
        platform: "leetcode",
        url: "https://leetcode.com/contest/",
        startTime: _nextSaturday(20, 0),
        duration: "1.5h",
        tags: ["competitive-programming", "biweekly"],
        eligibility: "Open to all LeetCode users",
      },
      {
        title: "CodeChef Starters",
        platform: "codechef",
        url: "https://www.codechef.com/contests",
        startTime: _nextWednesday(20, 0),
        duration: "2h",
        tags: ["competitive-programming", "weekly"],
        eligibility: "Open to all CodeChef users",
      },
      {
        title: "TechGig Code Gladiators",
        platform: "techgig",
        url: "https://www.techgig.com/codegladiators",
        startTime: new Date("2026-07-01T10:00:00Z"),
        endTime: new Date("2026-08-30T23:59:59Z"),
        duration: "Multi-round",
        tags: ["hackathon", "annual"],
        eligibility: "Indian professionals & students",
      },
    ];

    for (const entry of staticContests) {
      const endTime = entry.endTime || new Date(entry.startTime.getTime() + 5400000);
      const result = await Competition.updateOne(
        { platform: entry.platform, title: entry.title },
        { $setOnInsert: { ...entry, endTime } },
        { upsert: true }
      );
      if (result.upsertedCount) seeded++;
    }

  return seeded;
}

// @desc    Seed competitions from Codeforces API + static entries
// @route   POST /api/competitions/seed
// @access  Private (admin)
const seedCompetitions = async (req, res) => {
  try {
    const seeded = await _doSeedCompetitions();
    res.json({ message: `Seeded ${seeded} competitions` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Helpers for recurring contest dates ──
function _nextSunday(hour, min) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + ((7 - d.getUTCDay()) % 7 || 7));
  d.setUTCHours(hour, min, 0, 0);
  return d;
}

function _nextSaturday(hour, min) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + ((6 - d.getUTCDay() + 7) % 7 || 7));
  d.setUTCHours(hour, min, 0, 0);
  return d;
}

function _nextWednesday(hour, min) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + ((3 - d.getUTCDay() + 7) % 7 || 7));
  d.setUTCHours(hour, min, 0, 0);
  return d;
}

module.exports = { getCompetitions, setReminder, removeReminder, seedCompetitions };
