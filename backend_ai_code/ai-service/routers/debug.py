from fastapi import APIRouter, HTTPException, Request
from models.schemas import DebugRequest, DebugResponse
from services.mock_ai import debug_code

router = APIRouter(tags=["Debug"])


@router.post("/debug", response_model=DebugResponse)
async def debug_endpoint(request_body: DebugRequest, request: Request):
    try:
        custom_key = request.headers.get("x-user-api-key")
        result = debug_code(request_body.code, request_body.language, request_body.error, custom_key)
        return DebugResponse(
            explanation=result["explanation"],
            fixedCode=result["fixedCode"],
            suggestions=result["suggestions"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
