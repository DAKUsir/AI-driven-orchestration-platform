from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
from services.mock_ai import chat_response

router = APIRouter(tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        content = chat_response(request.messages, request.contextType)
        return ChatResponse(content=content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
