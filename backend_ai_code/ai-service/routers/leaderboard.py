from fastapi import APIRouter, Query
from services.leaderboard import get_leaderboard, get_user_rank

router = APIRouter(tags=["Leaderboard"])


@router.get("/leaderboard")
def leaderboard(limit: int = Query(10, ge=1, le=50)):
    entries = get_leaderboard(limit)
    return {"leaderboard": entries, "total": len(entries)}


@router.get("/leaderboard/rank/{user_id}")
def user_rank(user_id: str):
    result = get_user_rank(user_id)
    return result
