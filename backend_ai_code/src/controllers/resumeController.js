const Resume = require("../models/Resume");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

// Gradio space base URL
const GRADIO_SPACE = "https://girishwangikar-resumeats.hf.space";
const GRADIO_TIMEOUT = 120000; // 2 minutes

// ── Helper: Upload file to Gradio ──────────────────────────────────────────

const uploadFileToGradio = async (filePath) => {
  const form = new FormData();
  form.append("files", fs.createReadStream(filePath));

  const { data } = await axios.post(`${GRADIO_SPACE}/upload`, form, {
    headers: { ...form.getHeaders() },
    timeout: GRADIO_TIMEOUT,
  });

  if (!data || data.length === 0) {
    throw new Error("File upload to Gradio failed");
  }
  return data[0]; // Returns file handle object
};

// ── Helper: Call Gradio via /call/<api_name> two-step pattern ───────────────

const callGradio = async (apiName, requestData) => {
  // Step 1: POST to /call/<api_name> to get event_id
  const postRes = await axios.post(
    `${GRADIO_SPACE}/call${apiName}`,
    { data: requestData },
    {
      headers: { "Content-Type": "application/json" },
      timeout: GRADIO_TIMEOUT,
    }
  );

  const eventId = postRes.data?.event_id;
  if (!eventId) {
    throw new Error("Gradio did not return an event_id");
  }

  // Step 2: GET /call/<api_name>/<event_id> to get results (SSE stream)
  const getRes = await axios.get(
    `${GRADIO_SPACE}/call${apiName}/${eventId}`,
    { timeout: GRADIO_TIMEOUT, responseType: "stream" }
  );

  return new Promise((resolve, reject) => {
    let resultData = null;
    let buffer = "";

    getRes.data.on("data", (chunk) => {
      buffer += chunk.toString("utf8");

      // Check if we reached the complete event
      if (buffer.includes("event: complete")) {
        const parts = buffer.split("event: complete");
        const afterComplete = parts[1];
        if (afterComplete && afterComplete.includes("data:")) {
          const jsonStrLine = afterComplete.split("\n").find((line) => line.trim().startsWith("data:"));
          if (jsonStrLine) {
            try {
              // Extract the JSON part after 'data:'
              const jsonContent = jsonStrLine.trim().substring(5).trim();
              resultData = JSON.parse(jsonContent);
              resolve(resultData);
            } catch (e) {
              console.error("[Gradio] Failed to parse complete event data", e);
            }
          }
        }
      }

      // Handle errors
      if (buffer.includes("event: error")) {
        reject(new Error("Gradio returned an error event"));
      }
    });

    getRes.data.on("end", () => {
      if (!resultData) {
        // Fallback: search the entire buffer for the last valid data payload
        const lines = buffer.split("\n");
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i].trim();
          if (line.startsWith("data:")) {
            try {
              const jsonContent = line.substring(5).trim();
              resultData = JSON.parse(jsonContent);
              resolve(resultData);
              return;
            } catch (e) {
              // keep looking
            }
          }
        }
        reject(new Error("Stream ended without completion payload"));
      }
    });

    getRes.data.on("error", (err) => reject(err));
  });
};

// ── Controllers ─────────────────────────────────────────────────────────────

// @desc    Upload and parse resume via Gradio /process_resume
// @route   POST /api/resume/upload
// @access  Private
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const filePath = req.file.path;

    // Step 1: Upload file to Gradio space
    const gradioFile = await uploadFileToGradio(filePath);

    // Step 2: Call /process_resume to parse it
    // Gradio 4+ requires file inputs to be structured as FileData objects
    const fileData = {
      path: gradioFile,
      meta: { _type: "gradio.FileData" }
    };
    
    const result = await callGradio("/process_resume", [fileData]);
    const parsedText = Array.isArray(result) ? result[0] : result?.data?.[0] || "";

    // Save to DB
    const resume = await Resume.create({
      userId: req.user.id,
      originalFile: filePath,
      extractedText: parsedText,
      targetRole: req.body.targetRole || "",
    });

    res.status(201).json({
      parsedText,
      resumeId: resume._id,
      filename: req.file.originalname,
    });
  } catch (error) {
    console.error("[Resume] Upload/Parse error:", error.message);
    res.status(500).json({
      message: error.message || "Failed to process resume",
    });
  }
};

// @desc    Analyze resume text with optional job description
// @route   POST /api/resume/analyze
// @access  Private
const analyzeResumeText = async (req, res) => {
  try {
    const {
      resumeText,
      jobDescription = "",
      withJobDescription = true,
      temperature = 0.5,
      maxTokens = 1024,
    } = req.body;

    if (!resumeText) {
      return res.status(400).json({ message: "Resume text is required" });
    }

    const result = await callGradio("/analyze_resume", [
      resumeText,
      jobDescription,
      withJobDescription,
      temperature,
      maxTokens,
    ]);

    const analysis = Array.isArray(result) ? result[0] : result?.data?.[0] || "";
    res.json({ analysis });
  } catch (error) {
    console.error("[Resume] Analyze error:", error.message);
    res.status(500).json({
      message: "Resume analysis failed. The AI service may be busy — try again.",
    });
  }
};

// @desc    Rephrase resume text
// @route   POST /api/resume/rephrase
// @access  Private
const rephraseText = async (req, res) => {
  try {
    const { text, temperature = 0.5, maxTokens = 1024 } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const result = await callGradio("/rephrase_text", [
      text,
      temperature,
      maxTokens,
    ]);

    const rephrased = Array.isArray(result) ? result[0] : result?.data?.[0] || "";
    res.json({ rephrased });
  } catch (error) {
    console.error("[Resume] Rephrase error:", error.message);
    res.status(500).json({
      message: "Rephrase failed. The AI service may be busy — try again.",
    });
  }
};

// @desc    Generate cover letter
// @route   POST /api/resume/cover-letter
// @access  Private
const generateCoverLetter = async (req, res) => {
  try {
    const {
      resumeText,
      jobDescription,
      temperature = 0.5,
      maxTokens = 1024,
    } = req.body;

    if (!resumeText || !jobDescription) {
      return res
        .status(400)
        .json({ message: "Resume text and job description are required" });
    }

    const result = await callGradio("/generate_cover_letter", [
      resumeText,
      jobDescription,
      temperature,
      maxTokens,
    ]);

    const coverLetter = Array.isArray(result) ? result[0] : result?.data?.[0] || "";
    res.json({ coverLetter });
  } catch (error) {
    console.error("[Resume] Cover letter error:", error.message);
    res.status(500).json({
      message: "Cover letter generation failed. Try again.",
    });
  }
};

// @desc    Generate interview questions from job description
// @route   POST /api/resume/interview-questions
// @access  Private
const generateInterviewQuestions = async (req, res) => {
  try {
    const { jobDescription, temperature = 0.5, maxTokens = 1024 } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required" });
    }

    const result = await callGradio("/generate_interview_questions", [
      jobDescription,
      temperature,
      maxTokens,
    ]);

    const questions = Array.isArray(result) ? result[0] : result?.data?.[0] || "";
    res.json({ questions });
  } catch (error) {
    console.error("[Resume] Interview questions error:", error.message);
    res.status(500).json({
      message: "Interview questions generation failed. Try again.",
    });
  }
};

// @desc    Get resume history
// @route   GET /api/resume/history
// @access  Private
const getResumeHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadResume,
  analyzeResumeText,
  rephraseText,
  generateCoverLetter,
  generateInterviewQuestions,
  getResumeHistory,
};
