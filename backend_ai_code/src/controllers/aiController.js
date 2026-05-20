const axios = require("axios");

const GITHUB_MODELS_URL = "https://models.github.ai/inference/chat/completions";

async function callGitHubAI(messages, { temperature = 0.7, max_tokens = 2048 } = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("AI service not configured. Set GITHUB_TOKEN.");

  const models = ["gpt-4o", "gpt-4o-mini"];
  for (const model of models) {
    try {
      const res = await axios.post(
        GITHUB_MODELS_URL,
        { model, messages, temperature, max_tokens },
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          timeout: 60000,
        }
      );
      return res.data?.choices?.[0]?.message?.content || "";
    } catch (err) {
      if (err.response?.status !== 404 && err.response?.status !== 422) throw err;
      // try next model
    }
  }
  throw new Error("All AI models failed");
}

// @desc    Chat with AI (code editor assistant)
// @route   POST /api/ai/chat
// @access  Private
const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const content = await callGitHubAI([
      {
        role: "system",
        content:
          "You are an AI code assistant inside a code editor. Help users understand, debug, and improve their code. Be concise but thorough. Format code blocks with triple backticks.",
      },
      { role: "user", content: message },
    ]);

    res.json({ response: content || "Sorry, I couldn't generate a response." });
  } catch (error) {
    console.error("[AI Chat] Error:", error.message);
    res.status(500).json({ message: "AI service temporarily unavailable. Please try again." });
  }
};

// @desc    Generate tasks from a goal using AI
// @route   POST /api/ai/generate-tasks
// @access  Private
const generateTasks = async (req, res) => {
  try {
    const { goal, category = "other", count = 5, daysFromNow = 7 } = req.body;
    if (!goal) return res.status(400).json({ message: "Goal is required" });

    const today = new Date();
    const prompt = `You are a study task generator. The user wants to: "${goal}"
Category: ${category}
Generate exactly ${count} specific, actionable learning tasks for this goal.

Return ONLY valid JSON array (no markdown, no explanation):
[
  {
    "title": "Task title (specific and actionable)",
    "description": "Brief description of what to do",
    "category": "${category}",
    "priority": "medium",
    "difficulty": "medium",
    "estimatedMinutes": 45,
    "dueDate": "YYYY-MM-DD",
    "sourceLink": "https://relevant-resource-url-or-empty-string"
  }
]

Spread due dates from today (${today.toISOString().split("T")[0]}) across the next ${daysFromNow} days.
Priority must be one of: low, medium, high, urgent.
Difficulty must be one of: easy, medium, hard.
estimatedMinutes between 15 and 180.`;

    const raw = await callGitHubAI(
      [{ role: "user", content: prompt }],
      { temperature: 0.5, max_tokens: 2048 }
    );

    // Extract JSON from the response
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("AI returned invalid format");

    const tasks = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(tasks)) throw new Error("Expected array of tasks");

    res.json({ tasks: tasks.slice(0, count) });
  } catch (error) {
    console.error("[AI Generate Tasks] Error:", error.message);
    res.status(500).json({ message: "Failed to generate tasks. Please try again." });
  }
};

// @desc    Suggest YouTube playlists/courses for a topic
// @route   POST /api/ai/youtube-suggest
// @access  Private
const suggestYoutubePlaylists = async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ message: "Topic is required" });

    const prompt = `You are a YouTube learning resource finder. The user wants to learn: "${topic}"

Suggest 5 real, high-quality YouTube playlists or channels for this topic.

Return ONLY valid JSON array (no markdown, no explanation):
[
  {
    "title": "Exact playlist/video title",
    "channel": "Channel name",
    "url": "https://www.youtube.com/playlist?list=REAL_PLAYLIST_ID or https://www.youtube.com/@channelname",
    "description": "What this covers in 1-2 sentences",
    "difficulty": "Beginner | Intermediate | Advanced",
    "estimatedHours": 10,
    "category": "one of: dsa, web-dev, python, java, ml-ai, devops, mobile, database, system-design, general"
  }
]

Only include real URLs that actually exist. For playlists use playlist format. For channels use @channel format.`;

    const raw = await callGitHubAI(
      [{ role: "user", content: prompt }],
      { temperature: 0.4, max_tokens: 2048 }
    );

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("AI returned invalid format");

    const suggestions = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(suggestions)) throw new Error("Expected array of suggestions");

    res.json({ suggestions: suggestions.slice(0, 5) });
  } catch (error) {
    console.error("[AI YouTube Suggest] Error:", error.message);
    res.status(500).json({ message: "Failed to get suggestions. Please try again." });
  }
};

module.exports = { handleChat, generateTasks, suggestYoutubePlaylists };
