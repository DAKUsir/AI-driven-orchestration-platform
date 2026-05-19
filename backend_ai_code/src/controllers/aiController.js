const axios = require("axios");

// Use the exact inference endpoint from GitHub Models documentation
const GITHUB_MODELS_URL = "https://models.github.ai/inference/chat/completions";

// @desc    Chat with AI (code editor assistant)
// @route   POST /api/ai/chat
// @access  Private
const handleChat = async (req, res) => {
  try {
    const { message, contextType } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return res.status(500).json({ message: "AI service not configured. Set GITHUB_TOKEN." });
    }

    const payload = {
      model: "gpt-4o", // GitHub Models uses "gpt-4o" as the official name, or try "gpt-5" if available
      messages: [
        {
          role: "system",
          content: "You are an AI code assistant inside a code editor. Help users understand, debug, and improve their code. Be concise but thorough. Format code blocks with triple backticks.",
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    };

    // Attempt 1: Try GPT-5 (as requested by user)
    try {
      const response = await axios.post(
        GITHUB_MODELS_URL,
        { ...payload, model: "gpt-5" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );

      const responseContent = response.data?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
      return res.json({ response: responseContent });
    } catch (gpt5Error) {
      console.log("[AI Chat] GPT-5 attempt failed:", gpt5Error.response?.status, JSON.stringify(gpt5Error.response?.data || gpt5Error.message));
      console.log("[AI Chat] Falling back to gpt-4o...");

      // Attempt 2: Fallback to GPT-4o
      const fallbackRes = await axios.post(
        GITHUB_MODELS_URL,
        { ...payload, model: "gpt-4o" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );

      const content = fallbackRes.data?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
      return res.json({ response: content });
    }

  } catch (error) {
    console.error("[AI Chat] Final error:", error.response?.status, JSON.stringify(error.response?.data || error.message));
    res.status(500).json({
      message: "AI service temporarily unavailable. Please try again.",
    });
  }
};

module.exports = { handleChat };
