const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_TIMEOUT = 30000;

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: AI_TIMEOUT,
  headers: { "Content-Type": "application/json" },
});

/**
 * Health check for the AI service
 */
const checkHealth = async () => {
  try {
    const response = await aiClient.get("/health");
    return response.data;
  } catch (error) {
    return { status: "unavailable" };
  }
};

/**
 * Generate a personalized roadmap using AI
 */
const generateRoadmap = async (userData) => {
  try {
    const response = await aiClient.post("/api/generate-roadmap", userData);
    return response.data;
  } catch (error) {
    console.error("[AI Service] Roadmap generation error:", error.message);
    throw {
      message: "AI roadmap service temporarily unavailable",
      fallback: true,
    };
  }
};

/**
 * Chat with the AI mentor
 */
const chatWithMentor = async (messages, contextType) => {
  try {
    const response = await aiClient.post("/api/chat", {
      messages,
      contextType,
    });
    return response.data;
  } catch (error) {
    console.error("[AI Service] Chat error:", error.message);
    throw {
      message: "AI mentor service temporarily unavailable",
      fallback: true,
    };
  }
};

/**
 * AI-powered code debugging
 */
const debugCode = async (code, language, error) => {
  try {
    const response = await aiClient.post("/api/debug", {
      code,
      language,
      error,
    });
    return response.data;
  } catch (err) {
    console.error("[AI Service] Debug error:", err.message);
    throw {
      message: "AI debug service temporarily unavailable",
      fallback: true,
    };
  }
};

/**
 * Analyze resume for ATS score and suggestions
 */
const analyzeResume = async (text, targetRole) => {
  try {
    const response = await aiClient.post("/api/analyze-resume", {
      text,
      targetRole,
    });
    return response.data;
  } catch (error) {
    console.error("[AI Service] Resume analysis error:", error.message);
    throw {
      message: "AI resume analyzer temporarily unavailable",
      fallback: true,
    };
  }
};

module.exports = {
  checkHealth,
  generateRoadmap,
  chatWithMentor,
  debugCode,
  analyzeResume,
};
