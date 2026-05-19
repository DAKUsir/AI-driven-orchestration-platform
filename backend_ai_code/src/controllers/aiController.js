const axios = require("axios");

const GITHUB_MODELS_URL = "https://models.inference.ai.azure.com/chat/completions";
const MODEL = "openai/gpt-5";

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

    const response = await axios.post(
      GITHUB_MODELS_URL,
      {
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are an AI code assistant inside a code editor. Help users understand, debug, and improve their code. Be concise but thorough. Format code blocks with triple backticks.",
          },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    const responseContent =
      response.data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    res.json({ response: responseContent });
  } catch (error) {
    const status = error.response?.status;
    const errData = error.response?.data;
    console.error("[AI Chat] Error:", status, JSON.stringify(errData || error.message));

    // If GPT-5 fails, try fallback to gpt-4o
    if (status === 400 || status === 404 || status === 422) {
      try {
        console.log("[AI Chat] Falling back to gpt-4o...");
        const fallbackRes = await axios.post(
          GITHUB_MODELS_URL,
          {
            model: "openai/gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are an AI code assistant inside a code editor. Help users understand, debug, and improve their code. Be concise but thorough. Format code blocks with triple backticks.",
              },
              { role: "user", content: req.body.message },
            ],
            temperature: 0.7,
            max_tokens: 2048,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              "Content-Type": "application/json",
            },
            timeout: 60000,
          }
        );

        const content =
          fallbackRes.data?.choices?.[0]?.message?.content ||
          "Sorry, I couldn't generate a response.";

        return res.json({ response: content });
      } catch (fallbackErr) {
        console.error("[AI Chat] Fallback also failed:", fallbackErr.response?.status, fallbackErr.message);
      }
    }

    res.status(500).json({
      message: "AI service temporarily unavailable. Please try again.",
    });
  }
};

module.exports = { handleChat };
