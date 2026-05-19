from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from services.resume_analyzer import (
    process_resume_file,
    analyze_resume,
    rephrase_text,
    generate_cover_letter,
    generate_interview_questions,
)
import tempfile
import os

router = APIRouter(tags=["Resume"])


# ── Request / Response schemas ────────────────────────────────────────
class AnalyzeResumeRequest(BaseModel):
    resumeText: str
    jobDescription: str = ""
    withJobDescription: bool = True
    temperature: float = 0.5
    maxTokens: int = 1024


class RephraseRequest(BaseModel):
    text: str
    temperature: float = 0.5
    maxTokens: int = 1024


class CoverLetterRequest(BaseModel):
    resumeText: str
    jobDescription: str
    temperature: float = 0.5
    maxTokens: int = 1024


class InterviewQuestionsRequest(BaseModel):
    jobDescription: str
    temperature: float = 0.5
    maxTokens: int = 1024


# ── 1. Upload & parse resume file ────────────────────────────────────
@router.post("/process-resume")
async def process_resume_endpoint(file: UploadFile = File(...)):
    """Upload a PDF/DOCX resume and get the parsed text content."""
    try:
        # Save the uploaded file to a temp location
        suffix = os.path.splitext(file.filename)[1] if file.filename else ".pdf"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        result = process_resume_file(tmp_path)

        # Clean up temp file
        os.unlink(tmp_path)

        return {"parsedText": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume processing failed: {str(e)}")


# ── 2. Analyse resume (ATS score, feedback) ──────────────────────────
@router.post("/analyze-resume")
async def analyze_resume_endpoint(request: AnalyzeResumeRequest):
    """Analyse parsed resume text against an optional job description."""
    try:
        result = analyze_resume(
            resume_text=request.resumeText,
            job_description=request.jobDescription,
            with_job_description=request.withJobDescription,
            temperature=request.temperature,
            max_tokens=request.maxTokens,
        )
        return {"analysis": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")


# ── 3. Rephrase text ─────────────────────────────────────────────────
@router.post("/rephrase-text")
async def rephrase_text_endpoint(request: RephraseRequest):
    """Rephrase a block of resume text to be more impactful."""
    try:
        result = rephrase_text(
            text=request.text,
            temperature=request.temperature,
            max_tokens=request.maxTokens,
        )
        return {"rephrasedText": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rephrase failed: {str(e)}")


# ── 4. Generate cover letter ─────────────────────────────────────────
@router.post("/generate-cover-letter")
async def generate_cover_letter_endpoint(request: CoverLetterRequest):
    """Generate a tailored cover letter from resume + job description."""
    try:
        result = generate_cover_letter(
            resume_text=request.resumeText,
            job_description=request.jobDescription,
            temperature=request.temperature,
            max_tokens=request.maxTokens,
        )
        return {"coverLetter": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cover letter generation failed: {str(e)}")


# ── 5. Generate interview questions ──────────────────────────────────
@router.post("/generate-interview-questions")
async def generate_interview_questions_endpoint(request: InterviewQuestionsRequest):
    """Generate interview questions based on a job description."""
    try:
        result = generate_interview_questions(
            job_description=request.jobDescription,
            temperature=request.temperature,
            max_tokens=request.maxTokens,
        )
        return {"questions": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interview question generation failed: {str(e)}")
