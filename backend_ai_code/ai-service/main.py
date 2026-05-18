from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import uvicorn
import os
import time

from routers.chat import router as chat_router
from routers.roadmap import router as roadmap_router
from routers.resume import router as resume_router
from routers.debug import router as debug_router
from routers.interview import router as interview_router
from routers.leaderboard import router as leaderboard_router

load_dotenv()

app = FastAPI(
    title="AI Code Platform - AI Service",
    description="AI-powered orchestration backend for coding interview preparation",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:5000,http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}", "path": str(request.url)},
    )


@app.get("/")
async def root():
    return {
        "service": "AI Code Platform - AI Service",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "chat": "/chat",
            "generate-roadmap": "/generate-roadmap",
            "analyze-resume": "/analyze-resume",
            "debug": "/debug",
            "interview": "/interview",
            "leaderboard": "/leaderboard",
            "docs": "/docs",
        }
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "uptime": time.time() - start_time,
    }


start_time = time.time()

app.include_router(chat_router, prefix="/api")
app.include_router(roadmap_router, prefix="/api")
app.include_router(resume_router, prefix="/api")
app.include_router(debug_router, prefix="/api")
app.include_router(interview_router, prefix="/api")
app.include_router(leaderboard_router, prefix="/api")

if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
