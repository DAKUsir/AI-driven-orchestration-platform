from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.mock_ai import break_task, prioritize_day, weekly_review_summary, reschedule_tasks

router = APIRouter(tags=["Planner"])


class BreakTaskRequest(BaseModel):
    goal: str
    context: str = ""


class PrioritizeDayRequest(BaseModel):
    tasks: List[dict]
    availableHours: float = 4


class WeeklyReviewRequest(BaseModel):
    completed: List[str]
    skipped: List[str]
    carried: List[str]


class RescheduleRequest(BaseModel):
    tasks: List[dict]
    availableHours: float = 4


@router.post("/break-task")
async def break_task_endpoint(request: BreakTaskRequest):
    """Break a large goal into smaller actionable tasks."""
    try:
        result = break_task(request.goal, request.context)
        return {"tasks": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/prioritize-day")
async def prioritize_day_endpoint(request: PrioritizeDayRequest):
    """Suggest optimal task order for today."""
    try:
        result = prioritize_day(request.tasks, request.availableHours)
        return {"prioritized": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/weekly-review")
async def weekly_review_endpoint(request: WeeklyReviewRequest):
    """Generate a weekly review summary."""
    try:
        result = weekly_review_summary(request.completed, request.skipped, request.carried)
        return {"summary": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reschedule")
async def reschedule_endpoint(request: RescheduleRequest):
    """Smart rescheduling of missed tasks."""
    try:
        result = reschedule_tasks(request.tasks, request.availableHours)
        return {"rescheduled": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
