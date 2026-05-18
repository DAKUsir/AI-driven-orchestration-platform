from fastapi import APIRouter, HTTPException, Request
from models.schemas import ChatRequest, ChatResponse
from services.mock_ai import chat_response

router = APIRouter(tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request_body: ChatRequest, request: Request):
    try:
        custom_key = request.headers.get("x-user-api-key")
        content = chat_response(request_body.messages, request_body.contextType, custom_key)
        return ChatResponse(content=content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
