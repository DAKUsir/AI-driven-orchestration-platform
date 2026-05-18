from fastapi import APIRouter, HTTPException
from models.schemas import InterviewRequest, InterviewResponse, InterviewQuestion, InterviewFeedback
from services.mock_ai import generate_interview_questions

router = APIRouter(tags=["Interview"])


@router.post("/interview", response_model=InterviewResponse)
async def interview_endpoint(request: InterviewRequest):
    try:
        result = generate_interview_questions(
            interview_type=request.interview_type,
            difficulty=request.difficulty,
            role=request.role
        )

        questions = [InterviewQuestion(**q) for q in result["questions"]]
        feedback = InterviewFeedback(**result["feedback"])

        return InterviewResponse(questions=questions, feedback=feedback)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
