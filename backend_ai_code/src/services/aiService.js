const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_TIMEOUT = 60000;

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
 * Break a large goal into smaller actionable tasks
 */
const breakTask = async (goal, context = "") => {
  try {
    const response = await aiClient.post("/api/break-task", { goal, context });
    return response.data;
  } catch (error) {
    console.error("[AI Service] Break task error:", error.message);
    throw { message: "AI task breakdown service temporarily unavailable", fallback: true };
  }
};

/**
 * Suggest optimal task order for today
 */
const prioritizeDay = async (tasks, availableHours = 4) => {
  try {
    const response = await aiClient.post("/api/prioritize-day", { tasks, availableHours });
    return response.data;
  } catch (error) {
    console.error("[AI Service] Prioritize error:", error.message);
    throw { message: "AI prioritization service temporarily unavailable", fallback: true };
  }
};

/**
 * Generate weekly review summary
 */
const getWeeklyReview = async (completed, skipped, carried) => {
  try {
    const response = await aiClient.post("/api/weekly-review", { completed, skipped, carried });
    return response.data;
  } catch (error) {
    console.error("[AI Service] Weekly review error:", error.message);
    throw { message: "AI review service temporarily unavailable", fallback: true };
  }
};

/**
 * Smart rescheduling of missed tasks
 */
const rescheduleTasks = async (tasks, availableHours = 4) => {
  try {
    const response = await aiClient.post("/api/reschedule", { tasks, availableHours });
    return response.data;
  } catch (error) {
    console.error("[AI Service] Reschedule error:", error.message);
    throw { message: "AI reschedule service temporarily unavailable", fallback: true };
  }
};

// ── Resume Analyzer (Gradio proxy via FastAPI) ──────────────────────

/**
 * Process a resume file via Gradio space
 */
const processResume = async (filePath) => {
  try {
    const FormData = require("form-data");
    const fs = require("fs");
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const response = await aiClient.post("/api/resume/process", form, {
      headers: { ...form.getHeaders() },
      timeout: 120000,
    });
    return response.data;
  } catch (error) {
    console.error("[AI Service] Process resume error:", error.message);
    throw { message: "Resume processing service temporarily unavailable" };
  }
};

/**
 * Analyze resume text with optional job description
 */
const analyzeResume = async (resumeText, jobDescription = "", withJobDescription = true, temperature, maxTokens) => {
  try {
    const response = await aiClient.post("/api/resume/analyze", {
      resume_text: resumeText,
      job_description: jobDescription,
      with_job_description: withJobDescription,
      temperature,
      max_tokens: maxTokens,
    });
    return response.data;
  } catch (error) {
    console.error("[AI Service] Analyze resume error:", error.message);
    throw { message: "Resume analysis service temporarily unavailable" };
  }
};

/**
 * Rephrase resume text
 */
const rephraseText = async (text, temperature, maxTokens) => {
  try {
    const response = await aiClient.post("/api/resume/rephrase", {
      text,
      temperature,
      max_tokens: maxTokens,
    });
    return response.data;
  } catch (error) {
    console.error("[AI Service] Rephrase error:", error.message);
    throw { message: "Rephrase service temporarily unavailable" };
  }
};

/**
 * Generate cover letter
 */
const generateCoverLetter = async (resumeText, jobDescription, temperature, maxTokens) => {
  try {
    const response = await aiClient.post("/api/resume/cover-letter", {
      resume_text: resumeText,
      job_description: jobDescription,
      temperature,
      max_tokens: maxTokens,
    });
    return response.data;
  } catch (error) {
    console.error("[AI Service] Cover letter error:", error.message);
    throw { message: "Cover letter service temporarily unavailable" };
  }
};

/**
 * Generate interview questions
 */
const generateInterviewQuestions = async (jobDescription, temperature, maxTokens) => {
  try {
    const response = await aiClient.post("/api/resume/interview-questions", {
      job_description: jobDescription,
      temperature,
      max_tokens: maxTokens,
    });
    return response.data;
  } catch (error) {
    console.error("[AI Service] Interview questions error:", error.message);
    throw { message: "Interview questions service temporarily unavailable" };
  }
};

module.exports = {
  checkHealth,
  breakTask,
  prioritizeDay,
  getWeeklyReview,
  rescheduleTasks,
  processResume,
  analyzeResume,
  rephraseText,
  generateCoverLetter,
  generateInterviewQuestions,
};
