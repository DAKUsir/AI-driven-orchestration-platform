from fastapi import APIRouter, HTTPException
from models.schemas import ResumeRequest, ResumeResponse
from services.mock_ai import analyze_resume

router = APIRouter(tags=["Resume"])


@router.post("/analyze-resume", response_model=ResumeResponse)
async def analyze_resume_endpoint(request: ResumeRequest):
    try:
        result = analyze_resume(request.text, request.targetRole)
        return ResumeResponse(
            atsScore=result["atsScore"],
            strengths=result["strengths"],
            weaknesses=result["weaknesses"],
            suggestions=result["suggestions"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
