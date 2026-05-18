from fastapi import APIRouter, HTTPException
from models.schemas import DebugRequest, DebugResponse
from services.mock_ai import debug_code

router = APIRouter(tags=["Debug"])


@router.post("/debug", response_model=DebugResponse)
async def debug_endpoint(request: DebugRequest):
    try:
        result = debug_code(request.code, request.language, request.error)
        return DebugResponse(
            explanation=result["explanation"],
            fixedCode=result["fixedCode"],
            suggestions=result["suggestions"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
