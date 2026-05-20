const SheetLink = require("../models/SheetLink");

// @desc    Get all DSA sheets with optional tag filter
// @route   GET /api/sheets
// @access  Private
const getSheets = async (req, res) => {
  try {
    const { tag } = req.query;
    const filter = {};
    if (tag) filter.tags = { $in: [tag] };

    const sheets = await SheetLink.find(filter).sort({ upvotes: -1 });
    res.json(sheets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed curated DSA sheets
// @route   POST /api/sheets/seed
// @access  Private (admin)
const seedSheets = async (req, res) => {
  try {
    const seeds = [
      {
        title: "Striver's SDE Sheet",
        author: "Striver (Raj Vikramaditya)",
        url: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/",
        description: "Top 191 DSA problems curated for SDE interviews at top product companies. Covers arrays, linked lists, trees, DP, graphs, and more.",
        problemCount: 191,
        tags: ["interview-ready", "revision"],
        category: "DSA",
        isVerified: true,
      },
      {
        title: "Striver's A2Z DSA Sheet",
        author: "Striver (Raj Vikramaditya)",
        url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
        description: "Complete A-to-Z DSA course with 450+ problems ordered from basics to advanced. Best for building strong foundations.",
        problemCount: 456,
        tags: ["beginner", "mixed"],
        category: "DSA",
        isVerified: true,
      },
      {
        title: "NeetCode 150",
        author: "NeetCode",
        url: "https://neetcode.io/practice",
        description: "150 curated LeetCode problems organized by topic with video explanations. Industry standard for FAANG prep.",
        problemCount: 150,
        tags: ["interview-ready", "revision"],
        category: "DSA",
        isVerified: true,
      },
      {
        title: "NeetCode Roadmap",
        author: "NeetCode",
        url: "https://neetcode.io/roadmap",
        description: "Visual roadmap of DSA topics with categorized problems. Great for structured learning.",
        problemCount: 300,
        tags: ["beginner", "mixed"],
        category: "DSA",
        isVerified: true,
      },
      {
        title: "Apna College DSA Sheet",
        author: "Apna College (Aman Dhattarwal)",
        url: "https://docs.google.com/spreadsheets/d/1hXserPuxVoWMG9Hs7y8wVdRCJTcj3xMBAEYUOXQ5Xg/",
        description: "375 handpicked DSA problems with difficulty tags. Popular among Indian CS students.",
        problemCount: 375,
        tags: ["beginner", "mixed"],
        category: "DSA",
        isVerified: true,
      },
      {
        title: "Love Babbar DSA Sheet",
        author: "Love Babbar",
        url: "https://www.geeksforgeeks.org/dsa-sheet-by-love-babbar/",
        description: "450 DSA problems covering all major topics. Well-structured for interview preparation.",
        problemCount: 450,
        tags: ["interview-ready", "revision"],
        category: "DSA",
        isVerified: true,
      },
      {
        title: "Fraz DSA Sheet",
        author: "Fraz (Muhammad Fraz)",
        url: "https://docs.google.com/spreadsheets/d/1-wKcV99KtO91dXdPkwmXGTdtyxAfk1mbPXQg81R9sFE/",
        description: "200+ carefully selected DSA problems with company tags and difficulty ratings.",
        problemCount: 200,
        tags: ["interview-ready", "company-specific"],
        category: "DSA",
        isVerified: true,
      },
      {
        title: "Blind 75",
        author: "Yangshun (Tech Interview Handbook)",
        url: "https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions",
        description: "The original 75 must-do LeetCode problems recommended by a Facebook engineer. Gold standard for quick revision.",
        problemCount: 75,
        tags: ["revision", "interview-ready"],
        category: "DSA",
        isVerified: true,
      },
      {
        title: "GFG Company-wise Problems",
        author: "GeeksforGeeks",
        url: "https://www.geeksforgeeks.org/company-wise-coding-practice/",
        description: "Problems sorted by company (Amazon, Google, Microsoft, etc.). Essential for targeted company prep.",
        problemCount: 1000,
        tags: ["company-specific", "interview-ready"],
        category: "DSA",
        isVerified: true,
      },
      {
        title: "LeetCode Patterns",
        author: "Sean Prashad",
        url: "https://seanprashad.com/leetcode-patterns/",
        description: "170+ problems grouped by patterns (sliding window, two pointers, BFS/DFS, etc.). Best for pattern recognition.",
        problemCount: 170,
        tags: ["revision", "interview-ready"],
        category: "DSA",
        isVerified: true,
      },
    ];

    let seeded = 0;
    for (const s of seeds) {
      const result = await SheetLink.updateOne(
        { title: s.title },
        { $setOnInsert: s },
        { upsert: true }
      );
      if (result.upsertedCount) seeded++;
    }

    res.json({ message: `Seeded ${seeded} DSA sheets` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSheets, seedSheets };
