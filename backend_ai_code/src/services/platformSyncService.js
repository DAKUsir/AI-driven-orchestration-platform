const axios = require("axios");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// ─── LeetCode Sync ──────────────────────────────────────────────────────────

const LEETCODE_GRAPHQL = "https://leetcode.com/graphql";

const LEETCODE_QUERY = `
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      ranking
      reputation
      starRating
    }
    submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
      }
    }
    userCalendar {
      streak
    }
  }
}`;

/**
 * Fetch LeetCode stats for a given username via their public GraphQL API.
 * Returns: { totalSolved, easySolved, mediumSolved, hardSolved, ranking, streak }
 */
const syncLeetCode = async (username) => {
  try {
    const response = await axios.post(
      LEETCODE_GRAPHQL,
      {
        query: LEETCODE_QUERY,
        variables: { username },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Referer: "https://leetcode.com",
        },
        timeout: 15000,
      }
    );

    const user = response.data?.data?.matchedUser;
    if (!user) {
      throw new Error(`LeetCode user "${username}" not found`);
    }

    const submissions = user.submitStatsGlobal?.acSubmissionNum || [];
    const getCount = (diff) =>
      submissions.find((s) => s.difficulty === diff)?.count || 0;

    return {
      totalSolved: getCount("All"),
      easySolved: getCount("Easy"),
      mediumSolved: getCount("Medium"),
      hardSolved: getCount("Hard"),
      ranking: user.profile?.ranking?.toString() || "N/A",
      streak: user.userCalendar?.streak || 0,
      rawData: {
        profile: user.profile,
        submissions,
      },
    };
  } catch (error) {
    console.error("[PlatformSync] LeetCode sync error:", error.message);
    throw new Error(
      `Failed to sync LeetCode for "${username}": ${error.message}`
    );
  }
};

// ─── GeeksForGeeks Sync ─────────────────────────────────────────────────────

/**
 * Fetch GFG stats using their internal profile API.
 * Returns: { totalSolved, easySolved, mediumSolved, hardSolved, ranking }
 */
const syncGFG = async (username) => {
  try {
    const response = await axios.get(
      `https://geeks-for-geeks-stats-api.vercel.app/?userName=${encodeURIComponent(username)}`,
      { timeout: 15000 }
    );

    const data = response.data;
    if (!data || data.error) {
      throw new Error(`GFG user "${username}" not found`);
    }

    const totalSolved = parseInt(data.totalProblemsSolved) || 0;
    const easySolved = parseInt(data.Easy) || 0;
    const mediumSolved = parseInt(data.Medium) || 0;
    const hardSolved = parseInt(data.Hard) || 0;

    return {
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      ranking: data.instituteRank || "N/A",
      streak: 0,
      rawData: data,
    };
  } catch (error) {
    console.error("[PlatformSync] GFG sync error:", error.message);
    throw new Error(
      `Failed to sync GFG for "${username}": ${error.message}`
    );
  }
};

// ─── GitHub Repo Fetch ──────────────────────────────────────────────────────

/**
 * Parse a GitHub URL and return { owner, repo }.
 */
const parseGitHubUrl = (url) => {
  // Handle: https://github.com/owner/repo or github.com/owner/repo
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/]+)/
  );
  if (!match) throw new Error("Invalid GitHub URL");
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
};

/**
 * Auto-categorize a repo based on language and topics.
 */
const categorizeProject = (language, topics = []) => {
  const lang = (language || "").toLowerCase();
  const topicStr = topics.map((t) => t.toLowerCase()).join(" ");

  // AI/ML
  if (
    ["python", "jupyter notebook", "r"].includes(lang) &&
    /machine.?learning|deep.?learning|tensorflow|pytorch|keras|ai|ml|neural|nlp|computer.?vision|data.?science|pandas|numpy|scikit/.test(
      topicStr + " " + lang
    )
  ) {
    return "AI/ML";
  }
  if (/tensorflow|pytorch|keras|ml|ai|machine-learning|deep-learning/.test(topicStr)) {
    return "AI/ML";
  }

  // Data Science
  if (/data.?science|analytics|visualization|tableau|power.?bi|pandas|kaggle/.test(topicStr)) {
    return "Data Science";
  }

  // Mobile
  if (
    ["swift", "kotlin", "dart", "objective-c"].includes(lang) ||
    /react.?native|flutter|ios|android|mobile/.test(topicStr)
  ) {
    return "Mobile";
  }

  // DevOps
  if (
    ["dockerfile", "hcl", "shell"].includes(lang) ||
    /docker|kubernetes|ci.?cd|devops|terraform|ansible|jenkins|aws|cloud/.test(topicStr)
  ) {
    return "DevOps";
  }

  // Web Dev
  if (
    [
      "javascript",
      "typescript",
      "html",
      "css",
      "vue",
      "svelte",
      "php",
      "ruby",
    ].includes(lang) ||
    /react|next|vue|angular|express|node|web|frontend|backend|fullstack|django|flask|rails/.test(
      topicStr
    )
  ) {
    return "Web Dev";
  }

  // Systems
  if (
    ["c", "c++", "rust", "go", "zig"].includes(lang) ||
    /systems|embedded|os|kernel|compiler|low.?level/.test(topicStr)
  ) {
    return "Systems";
  }

  return "Other";
};

/**
 * Fetch GitHub repo metadata using the REST API.
 */
const fetchGitHubRepo = async (repoUrl) => {
  try {
    const { owner, repo } = parseGitHubUrl(repoUrl);
    const headers = {
      Accept: "application/vnd.github.v3+json",
    };
    if (GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
    }

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers, timeout: 15000 }
    );

    const data = response.data;
    const category = categorizeProject(data.language, data.topics || []);

    return {
      name: data.name,
      description: data.description || "",
      language: data.language || "Unknown",
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      topics: data.topics || [],
      category,
    };
  } catch (error) {
    console.error("[PlatformSync] GitHub fetch error:", error.message);
    throw new Error(`Failed to fetch GitHub repo: ${error.message}`);
  }
};

// ─── Points Calculation ─────────────────────────────────────────────────────

/**
 * Calculate points from synced platform data.
 * easy×2 + medium×5 + hard×10
 */
const calculateSyncPoints = (profiles) => {
  let points = 0;
  for (const profile of profiles) {
    points += (profile.easySolved || 0) * 2;
    points += (profile.mediumSolved || 0) * 5;
    points += (profile.hardSolved || 0) * 10;
  }
  return points;
};

module.exports = {
  syncLeetCode,
  syncGFG,
  fetchGitHubRepo,
  parseGitHubUrl,
  categorizeProject,
  calculateSyncPoints,
};
