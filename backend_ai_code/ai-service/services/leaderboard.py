MOCK_LEADERBOARD = [
    {"userId": "1", "name": "Alex Chen", "points": 2840, "streak": 45, "totalSolved": 187, "rank": 1},
    {"userId": "2", "name": "Sarah Kim", "points": 2510, "streak": 38, "totalSolved": 162, "rank": 2},
    {"userId": "3", "name": "James Wilson", "points": 2230, "streak": 31, "totalSolved": 145, "rank": 3},
    {"userId": "4", "name": "Priya Patel", "points": 1980, "streak": 27, "totalSolved": 128, "rank": 4},
    {"userId": "5", "name": "Marcus Brown", "points": 1750, "streak": 22, "totalSolved": 115, "rank": 5},
    {"userId": "6", "name": "Lisa Zhang", "points": 1520, "streak": 19, "totalSolved": 98, "rank": 6},
    {"userId": "7", "name": "David Lee", "points": 1340, "streak": 15, "totalSolved": 87, "rank": 7},
    {"userId": "8", "name": "Emma Davis", "points": 1120, "streak": 12, "totalSolved": 74, "rank": 8},
    {"userId": "9", "name": "Ryan Taylor", "points": 980, "streak": 8, "totalSolved": 62, "rank": 9},
    {"userId": "10", "name": "Olivia Martin", "points": 750, "streak": 5, "totalSolved": 48, "rank": 10},
]


def get_leaderboard(limit: int = 10):
    return MOCK_LEADERBOARD[:limit]


def get_user_rank(user_id: str):
    for entry in MOCK_LEADERBOARD:
        if entry["userId"] == user_id:
            return entry
    return {"userId": user_id, "name": "New User", "points": 100, "rank": len(MOCK_LEADERBOARD) + 1, "streak": 0, "totalSolved": 0}
