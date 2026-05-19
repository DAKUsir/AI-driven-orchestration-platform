from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import uvicorn
import os
import time

from routers.planner import router as planner_router
from routers.resume import router as resume_router

load_dotenv()

app = FastAPI(
    title="FinishIt - AI Planning Service",
    description="AI-powered task planning, prioritization, and review",
    version="3.0.0",
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
        "service": "FinishIt - AI Planning Service",
        "version": "3.0.0",
        "status": "running",
        "endpoints": {
            "break-task": "/api/break-task",
            "prioritize-day": "/api/prioritize-day",
            "weekly-review": "/api/weekly-review",
            "reschedule": "/api/reschedule",
            "docs": "/docs",
        }
    }


start_time = time.time()


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "uptime": time.time() - start_time,
    }


app.include_router(planner_router, prefix="/api")
app.include_router(resume_router, prefix="/api/resume")

if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
