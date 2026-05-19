"""
Resume Analyzer Service — powered by Hugging Face Gradio Space
Uses: girishwangikar/ResumeATS
"""

import os
import re
import json
import tempfile
from gradio_client import Client, handle_file

# ── Gradio client singleton ───────────────────────────────────────────
_client = None

SPACE_ID = "girishwangikar/ResumeATS"


def _get_client():
    """Lazy-initialise and cache the Gradio client."""
    global _client
    if _client is None:
        hf_token = os.environ.get("HF_TOKEN")  # optional, only for private spaces
        _client = Client(SPACE_ID, hf_token=hf_token) if hf_token else Client(SPACE_ID)
    return _client


# ── 1. Process / parse a resume file ──────────────────────────────────
def process_resume_file(file_path: str) -> str:
    """
    Upload a PDF/DOCX resume and get back the parsed text content.
    `file_path` can be a local path or a URL.
    """
    client = _get_client()
    result = client.predict(
        file=handle_file(file_path),
        api_name="/process_resume",
    )
    return result


# ── 2. Analyse resume (ATS scoring, feedback) ────────────────────────
def analyze_resume(
    resume_text: str,
    job_description: str = "",
    with_job_description: bool = True,
    temperature: float = 0.5,
    max_tokens: int = 1024,
) -> str:
    """
    Analyse parsed resume text against an optional job description.
    Returns the markdown analysis from the Gradio space.
    """
    client = _get_client()
    result = client.predict(
        resume_text=resume_text,
        job_description=job_description,
        with_job_description=with_job_description,
        temperature=temperature,
        max_tokens=max_tokens,
        api_name="/analyze_resume",
    )
    return result


# ── 3. Rephrase text ─────────────────────────────────────────────────
def rephrase_text(
    text: str,
    temperature: float = 0.5,
    max_tokens: int = 1024,
) -> str:
    """Rephrase a block of text using the Gradio space."""
    client = _get_client()
    result = client.predict(
        text=text,
        temperature=temperature,
        max_tokens=max_tokens,
        api_name="/rephrase_text",
    )
    return result


# ── 4. Generate cover letter ─────────────────────────────────────────
def generate_cover_letter(
    resume_text: str,
    job_description: str,
    temperature: float = 0.5,
    max_tokens: int = 1024,
) -> str:
    """Generate a tailored cover letter from resume + job description."""
    client = _get_client()
    result = client.predict(
        resume_text=resume_text,
        job_description=job_description,
        temperature=temperature,
        max_tokens=max_tokens,
        api_name="/generate_cover_letter",
    )
    return result


# ── 5. Generate interview questions ──────────────────────────────────
def generate_interview_questions(
    job_description: str,
    temperature: float = 0.5,
    max_tokens: int = 1024,
) -> str:
    """Generate interview questions based on a job description."""
    client = _get_client()
    result = client.predict(
        job_description=job_description,
        temperature=temperature,
        max_tokens=max_tokens,
        api_name="/generate_interview_questions",
    )
    return result
