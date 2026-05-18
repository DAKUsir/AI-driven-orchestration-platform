from fastapi import APIRouter, HTTPException
from models.schemas import RoadmapRequest, RoadmapResponse, RoadmapMilestone, RoadmapTask
from services.mock_ai import generate_roadmap

router = APIRouter(tags=["Roadmap"])


@router.post("/generate-roadmap", response_model=RoadmapResponse)
async def generate_roadmap_endpoint(request: RoadmapRequest):
    try:
        result = generate_roadmap(
            role=request.targetRole,
            skills=request.skills,
            experience_level=request.experienceLevel,
            daily_hours=request.dailyStudyHours
        )

        milestones = [RoadmapMilestone(**m) for m in result["milestones"]]
        tasks = [RoadmapTask(**t) for t in result["tasks"]]

        return RoadmapResponse(
            title=result["title"],
            durationWeeks=result["durationWeeks"],
            milestones=milestones,
            tasks=tasks
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
