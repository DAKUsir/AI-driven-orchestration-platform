from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    messages: List[dict]
    contextType: str = "general"

class ChatResponse(BaseModel):
    content: str

class RoadmapRequest(BaseModel):
    targetRole: str
    skills: List[str] = []
    experienceLevel: str = "beginner"
    dailyStudyHours: int = 2
    specificTrack: Optional[str] = None
    specificRole: Optional[str] = None

class RoadmapMilestone(BaseModel):
    week: int
    title: str
    description: str
    completed: bool = False

class RoadmapTask(BaseModel):
    title: str
    description: str
    platform: str
    platformLink: str
    difficulty: str
    taskType: str
    estimatedMinutes: int

class RoadmapResponse(BaseModel):
    title: str
    durationWeeks: int
    milestones: List[RoadmapMilestone]
    tasks: List[RoadmapTask]

class ResumeRequest(BaseModel):
    text: str
    targetRole: str = "Software Engineer"

class ResumeResponse(BaseModel):
    atsScore: int
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]

class DebugRequest(BaseModel):
    code: str
    language: str
    error: Optional[str] = None

class DebugResponse(BaseModel):
    explanation: str
    fixedCode: str
    suggestions: List[str]

class InterviewRequest(BaseModel):
    interview_type: str = "technical"
    difficulty: str = "medium"
    role: str = "Software Engineer"

class InterviewQuestion(BaseModel):
    question: str
    category: str
    difficulty: str

class InterviewFeedback(BaseModel):
    overall: int
    technical: int
    communication: int
    confidence: int
    strengths: List[str]
    improvements: List[str]

class InterviewResponse(BaseModel):
    questions: List[InterviewQuestion]
    feedback: Optional[InterviewFeedback] = None

class LeaderboardEntry(BaseModel):
    userId: str
    name: str
    email: str
    points: int
    streak: int
    totalSolved: int
    rank: int
